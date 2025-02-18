// Dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
const db = new sqlite3.Database('vhs.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
    createTables();
  }
});

// Create tables
function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS vhs_dozent (
      dozentnr INTEGER PRIMARY KEY AUTOINCREMENT,
      nachname VARCHAR NOT NULL,
      vorname VARCHAR NOT NULL,
      geschlecht CHAR(1) NOT NULL CHECK(geschlecht IN ('m', 'w', 'd')),
      strasse VARCHAR NOT NULL,
      plz CHAR(5) NOT NULL,
      ort VARCHAR NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS vhs_raum (
      raumnr INTEGER PRIMARY KEY AUTOINCREMENT,
      bezeichnung VARCHAR NOT NULL,
      strasse VARCHAR NOT NULL,
      plz CHAR(5) NOT NULL,
      ort VARCHAR NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS vhs_fachbereich (
      fbnr INTEGER PRIMARY KEY AUTOINCREMENT,
      bezeichnung VARCHAR NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS vhs_kursform (
      kfnr INTEGER PRIMARY KEY AUTOINCREMENT,
      bezeichnung VARCHAR NOT NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS vhs_kurs (
      kursnr CHAR(5) PRIMARY KEY,
      kursform INTEGER NOT NULL,
      kursbezeichnung VARCHAR NOT NULL,
      kursbeschreibung VARCHAR NOT NULL,
      dozentnr INTEGER NOT NULL,
      raumnr INTEGER NOT NULL,
      minteilnehmer INTEGER NOT NULL,
      maxteilnehmer INTEGER NOT NULL,
      fachbereich INTEGER NOT NULL,
      veranstaltungen INTEGER NOT NULL,
      stunden INTEGER NOT NULL,
      beginndatum DATE NOT NULL,
      tag VARCHAR NOT NULL,
      anfangszeit CHAR(5) NOT NULL,
      endzeit CHAR(5) NOT NULL,
      kursgebuehr DECIMAL(9,2) NOT NULL,
      FOREIGN KEY (kursform) REFERENCES vhs_kursform(kfnr),
      FOREIGN KEY (dozentnr) REFERENCES vhs_dozent(dozentnr),
      FOREIGN KEY (raumnr) REFERENCES vhs_raum(raumnr),
      FOREIGN KEY (fachbereich) REFERENCES vhs_fachbereich(fbnr)
    )`,
    
    `CREATE TABLE IF NOT EXISTS vhs_teilnehmer (
      teilnehmernr INTEGER PRIMARY KEY AUTOINCREMENT,
      nachname VARCHAR NOT NULL,
      vorname VARCHAR NOT NULL,
      geschlecht CHAR(1) CHECK(geschlecht IN ('m', 'w', 'd')),
      strasse VARCHAR NOT NULL,
      plz CHAR(5) CHECK(plz BETWEEN '00000' AND '99999'),
      ort VARCHAR NOT NULL,
      telefon VARCHAR,
      altersgruppe CHAR(2) CHECK(altersgruppe IN ('01', '02', '03', '04', '05', '06'))
    )`,
    
    `CREATE TABLE IF NOT EXISTS vhs_kursteilnehmer (
      kursnr CHAR(5) NOT NULL,
      teilnehmernr INTEGER NOT NULL,
      PRIMARY KEY (kursnr, teilnehmernr),
      FOREIGN KEY (kursnr) REFERENCES vhs_kurs(kursnr),
      FOREIGN KEY (teilnehmernr) REFERENCES vhs_teilnehmer(teilnehmernr)
    )`
  ];

  tables.forEach(table => {
    db.run(table, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  });
}

// API Endpoints

// 1. Course Search API
app.get('/api/kurse', (req, res) => {
  let query = `
    SELECT 
      k.*,
      d.nachname as dozent_nachname,
      d.vorname as dozent_vorname,
      r.bezeichnung as raum_bezeichnung,
      r.strasse as raum_strasse,
      r.ort as raum_ort,
      f.bezeichnung as fachbereich_bezeichnung,
      kf.bezeichnung as kursform_bezeichnung
    FROM vhs_kurs k
    JOIN vhs_dozent d ON k.dozentnr = d.dozentnr
    JOIN vhs_raum r ON k.raumnr = r.raumnr
    JOIN vhs_fachbereich f ON k.fachbereich = f.fbnr
    JOIN vhs_kursform kf ON k.kursform = kf.kfnr
    WHERE 1=1
  `;
  
  const params = [];

  // Add search filters based on query parameters
  if (req.query.fachbereich) {
    query += ` AND k.fachbereich = ?`;
    params.push(req.query.fachbereich);
  }

  if (req.query.kursform) {
    query += ` AND k.kursform = ?`;
    params.push(req.query.kursform);
  }

  if (req.query.tag) {
    query += ` AND k.tag LIKE ?`;
    params.push(`%${req.query.tag}%`);
  }

  if (req.query.beginndatum) {
    query += ` AND k.beginndatum >= ?`;
    params.push(req.query.beginndatum);
  }

  if (req.query.suchbegriff) {
    query += ` AND (k.kursbezeichnung LIKE ? OR k.kursbeschreibung LIKE ?)`;
    params.push(`%${req.query.suchbegriff}%`, `%${req.query.suchbegriff}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(rows);
  });
});

// 2. Participant Registration API
app.post('/api/anmeldung', (req, res) => {
  const { teilnehmer, kursnr } = req.body;

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // First, insert the participant
    const teilnehmerQuery = `
      INSERT INTO vhs_teilnehmer 
      (nachname, vorname, geschlecht, strasse, plz, ort, telefon, altersgruppe)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(teilnehmerQuery, 
      [
        teilnehmer.nachname,
        teilnehmer.vorname,
        teilnehmer.geschlecht,
        teilnehmer.strasse,
        teilnehmer.plz,
        teilnehmer.ort,
        teilnehmer.telefon,
        teilnehmer.altersgruppe
      ], 
      function(err) {
        if (err) {
          console.error(err);
          db.run('ROLLBACK');
          res.status(500).json({ error: 'Error registering participant' });
          return;
        }

        const teilnehmernr = this.lastID;

        // Check if the course exists and has available spots
        db.get(
          `SELECT 
            k.*,
            (SELECT COUNT(*) FROM vhs_kursteilnehmer kt WHERE kt.kursnr = k.kursnr) as current_teilnehmer
          FROM vhs_kurs k
          WHERE k.kursnr = ?`,
          [kursnr],
          (err, kurs) => {
            if (err || !kurs) {
              db.run('ROLLBACK');
              res.status(404).json({ error: 'Course not found' });
              return;
            }

            if (kurs.current_teilnehmer >= kurs.maxteilnehmer) {
              db.run('ROLLBACK');
              res.status(400).json({ error: 'Course is full' });
              return;
            }

            // Register participant for the course
            const registrationQuery = `
              INSERT INTO vhs_kursteilnehmer (kursnr, teilnehmernr)
              VALUES (?, ?)
            `;

            db.run(registrationQuery, [kursnr, teilnehmernr], (err) => {
              if (err) {
                console.error(err);
                db.run('ROLLBACK');
                res.status(500).json({ error: 'Error registering for course' });
                return;
              }

              db.run('COMMIT');
              res.status(201).json({
                message: 'Successfully registered for course',
                teilnehmernr: teilnehmernr,
                kursnr: kursnr
              });
            });
          }
        );
    });
  });
});

// Helper endpoints

// Get all Fachbereiche
app.get('/api/fachbereiche', (req, res) => {
  db.all('SELECT * FROM vhs_fachbereich', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(rows);
  });
});

// Get all Kursformen
app.get('/api/kursformen', (req, res) => {
  db.all('SELECT * FROM vhs_kursform', (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
  console.log(`VHS backend running on port ${port}`);
});

// Cleanup on exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});
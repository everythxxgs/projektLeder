-- First, let's insert some sample data for the reference tables

-- Fachbereiche (Departments)
INSERT INTO vhs_fachbereich (bezeichnung) VALUES
('Sprachen'),
('Gesundheit'),
('Kunst & Kultur'),
('Beruf & Karriere'),
('Computer & Digitales'),
('Gesellschaft & Leben');

-- Kursformen (Course Types)
INSERT INTO vhs_kursform (bezeichnung) VALUES
('Semesterkurs'),
('Intensivkurs'),
('Workshop'),
('Wochenendseminar'),
('Online-Kurs');

-- Dozenten (Instructors)
INSERT INTO vhs_dozent (nachname, vorname, geschlecht, strasse, plz, ort) VALUES
('Schmidt', 'Maria', 'w', 'Hauptstraße 1', '12345', 'Berlin'),
('Müller', 'Thomas', 'm', 'Schulstraße 15', '12347', 'Berlin'),
('Weber', 'Anna', 'w', 'Parkweg 3', '12349', 'Berlin'),
('Fischer', 'Michael', 'm', 'Gartenstraße 22', '12351', 'Berlin'),
('Koch', 'Sandra', 'w', 'Bergstraße 7', '12353', 'Berlin');

-- Räume (Rooms)
INSERT INTO vhs_raum (bezeichnung, strasse, plz, ort) VALUES
('Raum 101 - Sprachenlabor', 'Bildungsallee 1', '12345', 'Berlin'),
('Raum 102 - Computerlabor', 'Bildungsallee 1', '12345', 'Berlin'),
('Raum 201 - Kunstatelier', 'Bildungsallee 1', '12345', 'Berlin'),
('Raum 202 - Bewegungsraum', 'Bildungsallee 1', '12345', 'Berlin'),
('Seminarraum 301', 'Bildungsallee 1', '12345', 'Berlin');

-- Kurse (Courses)
INSERT INTO vhs_kurs (
    kursnr, kursform, kursbezeichnung, kursbeschreibung, 
    dozentnr, raumnr, minteilnehmer, maxteilnehmer, 
    fachbereich, veranstaltungen, stunden, 
    beginndatum, tag, anfangszeit, endzeit, kursgebuehr
) VALUES
-- Sprachen
('SP101', 1, 'Englisch A1 für Anfänger', 
 'Grundkurs für absolute Anfänger. Lernen Sie die Basics der englischen Sprache.',
 1, 1, 8, 15, 1, 15, 30, '2025-03-01', 'Montag', '18:00', '19:30', 120.00),

('SP102', 2, 'Spanisch-Intensiv A2', 
 'Intensivkurs für Teilnehmer mit Grundkenntnissen. Schneller Fortschritt garantiert!',
 3, 1, 6, 12, 1, 10, 40, '2025-03-15', 'Dienstag', '17:30', '20:30', 180.00),

-- Gesundheit
('GE201', 1, 'Yoga für Anfänger', 
 'Einführung in die Grundlagen des Hatha-Yoga. Entspannung und Beweglichkeit.',
 5, 4, 8, 20, 2, 12, 24, '2025-03-03', 'Mittwoch', '09:00', '10:30', 95.00),

('GE202', 4, 'Ernährungsberatung Kompakt', 
 'Wochenendseminar über gesunde Ernährung, Meal Prep und Nachhaltigkeit.',
 2, 5, 10, 25, 2, 2, 16, '2025-04-05', 'Samstag', '10:00', '17:00', 140.00),

-- Kunst & Kultur
('KU301', 1, 'Acrylmalerei Grundkurs', 
 'Lernen Sie die Grundtechniken der Acrylmalerei. Für absolute Anfänger geeignet.',
 4, 3, 6, 12, 3, 10, 20, '2025-03-04', 'Donnerstag', '18:30', '20:30', 160.00),

-- Beruf & Karriere
('BE401', 5, 'Excel für Fortgeschrittene', 
 'Online-Kurs: Pivot-Tabellen, Makros und fortgeschrittene Funktionen.',
 2, 2, 8, 15, 4, 8, 16, '2025-03-10', 'Montag', '19:00', '21:00', 140.00),

-- Computer & Digitales
('DI501', 3, 'Webdesign Basics', 
 'Workshop: HTML, CSS und Responsive Design für Einsteiger.',
 1, 2, 6, 12, 5, 6, 24, '2025-03-20', 'Freitag', '16:00', '19:00', 200.00),

('DI502', 1, 'Smartphone für Senioren', 
 'Grundlagenkurs für die Nutzung von Smartphones im Alltag.',
 3, 2, 6, 10, 5, 8, 16, '2025-03-05', 'Mittwoch', '10:00', '11:30', 80.00),

-- Gesellschaft & Leben
('GS601', 4, 'Konfliktmanagement', 
 'Wochenendseminar: Konflikte erkennen, verstehen und lösen.',
 5, 5, 8, 16, 6, 2, 16, '2025-04-12', 'Samstag', '09:30', '16:30', 160.00),

('GS602', 1, 'Fotografie für Einsteiger', 
 'Von Automatik zu manuellen Einstellungen. Grundlagen der Bildgestaltung.',
 4, 5, 8, 15, 6, 10, 20, '2025-03-06', 'Donnerstag', '18:00', '20:00', 150.00);
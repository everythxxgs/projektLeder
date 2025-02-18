<script>
    import { selectedCourse, currentView } from '../stores.js';
    
    let participant = {
      nachname: '',
      vorname: '',
      geschlecht: '',
      strasse: '',
      plz: '',
      ort: '',
      telefon: '',
      altersgruppe: ''
    };
    
    let loading = false;
    let error = null;
    let success = false;
  
    async function submitRegistration() {
      if (!$selectedCourse) {
        error = 'Bitte wählen Sie zuerst einen Kurs aus.';
        return;
      }
  
      loading = true;
      error = null;
      success = false;
  
      try {
        const response = await fetch('http://localhost:3000/api/anmeldung', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            teilnehmer: participant,
            kursnr: $selectedCourse.kursnr
          })
        });
  
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Anmeldung fehlgeschlagen');
        }
  
        success = true;
        participant = {
          nachname: '',
          vorname: '',
          geschlecht: '',
          strasse: '',
          plz: '',
          ort: '',
          telefon: '',
          altersgruppe: ''
        };
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  </script>
  
  <div class="max-w-2xl mx-auto">
    <h2 class="text-2xl mb-6">Kursanmeldung</h2>
  
    {#if $selectedCourse}
      <div class="bg-blue-100 p-4 rounded mb-6">
        <h3 class="font-bold mb-2">Ausgewählter Kurs:</h3>
        <p>{$selectedCourse.kursbezeichnung}</p>
        <p class="text-sm">
          Beginn: {new Date($selectedCourse.beginndatum).toLocaleDateString()}<br>
          Zeit: {$selectedCourse.tag}, {$selectedCourse.anfangszeit} - {$selectedCourse.endzeit}
        </p>
      </div>
    {:else}
      <div class="bg-yellow-100 p-4 rounded mb-6">
        <p>Bitte wählen Sie zuerst einen Kurs aus der Kurssuche aus.</p>
        <button 
          class="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          on:click={() => currentView.set('search')}>
          Zur Kurssuche
        </button>
      </div>
    {/if}
  
    <form 
      on:submit|preventDefault={submitRegistration}
      class="bg-white p-6 rounded shadow">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-2">Nachname *</label>
          <input 
            type="text"
            required
            class="w-full p-2 border rounded"
            bind:value={participant.nachname}>
        </div>
        
        <div>
          <label class="block mb-2">Vorname *</label>
          <input 
            type="text"
            required
            class="w-full p-2 border rounded"
            bind:value={participant.vorname}>
        </div>
        
        <div>
          <label class="block mb-2">Geschlecht *</label>
          <select 
            required
            class="w-full p-2 border rounded"
            bind:value={participant.geschlecht}>
            <option value="">Bitte wählen</option>
            <option value="m">männlich</option>
            <option value="w">weiblich</option>
            <option value="d">divers</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-2">Altersgruppe *</label>
          <select 
            required
            class="w-full p-2 border rounded"
            bind:value={participant.altersgruppe}>
            <option value="">Bitte wählen</option>
            <option value="01">unter 18 Jahre</option>
            <option value="02">18 bis 24 Jahre</option>
            <option value="03">25 bis 34 Jahre</option>
            <option value="04">35 bis 49 Jahre</option>
            <option value="05">50 bis 64 Jahre</option>
            <option value="06">über 64 Jahre</option>
          </select>
        </div>
        
        <div class="md:col-span-2">
          <label class="block mb-2">Straße und Hausnummer *</label>
          <input 
            type="text"
            required
            class="w-full p-2 border rounded"
            bind:value={participant.strasse}>
        </div>
        
        <div>
          <label class="block mb-2">PLZ *</label>
          <input 
            type="text"
            required
            class="w-full p-2 border rounded"
            bind:value={participant.plz}>
        </div>
        
        <div>
          <label class="block mb-2">Ort *</label>
          <input 
            type="text"
            required
            class="w-full p-2 border rounded"
            bind:value={participant.ort}>
        </div>
        
        <div class="md:col-span-2">
          <label class="block mb-2">Telefon</label>
          <input 
            type="tel"
            class="w-full p-2 border rounded"
            bind:value={participant.telefon}>
        </div>
      </div>
  
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      {/if}
  
      {#if success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          Anmeldung erfolgreich! Sie erhalten in Kürze eine Bestätigung.
        </div>
      {/if}
  
      <button 
        type="submit"
        class="mt-6 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        disabled={loading || !$selectedCourse}>
        {loading ? 'Wird verarbeitet...' : 'Anmeldung absenden'}
      </button>
    </form>
  </div>
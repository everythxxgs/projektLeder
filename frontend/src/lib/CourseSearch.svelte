<script>
  import { onMount } from 'svelte';
  import { selectedCourse } from '../stores.js';
  
  let searchParams = {
    fachbereich: '',
    kursform: '',
    tag: '',
    beginndatum: '',
    suchbegriff: ''
  };
  
  let courses = [];
  let fachbereiche = [];
  let kursformen = [];
  let loading = false;
  let error = null;

  onMount(async () => {
    try {
      const [fbResponse, kfResponse] = await Promise.all([
        fetch('http://localhost:3000/api/fachbereiche'),
        fetch('http://localhost:3000/api/kursformen')
      ]);
      
      fachbereiche = await fbResponse.json();
      kursformen = await kfResponse.json();
    } catch (err) {
      error = 'Fehler beim Laden der Filterdaten';
    }
  });

  async function searchCourses() {
    loading = true;
    error = null;
    
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`http://localhost:3000/api/kurse?${params}`);
      courses = await response.json();
    } catch (err) {
      error = 'Fehler bei der Kurssuche';
    } finally {
      loading = false;
    }
  }

  function selectCourse(course) {
    selectedCourse.set(course);
    currentView.set('registration');
  }
</script>

<div class="max-w-4xl mx-auto">
  <h2 class="text-2xl mb-6">Kurssuche</h2>
  
  <div class="bg-white p-6 rounded shadow mb-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block mb-2">Fachbereich</label>
        <select 
          class="w-full p-2 border rounded"
          bind:value={searchParams.fachbereich}>
          <option value="">Alle Fachbereiche</option>
          {#each fachbereiche as fb}
            <option value={fb.fbnr}>{fb.bezeichnung}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label class="block mb-2">Kursform</label>
        <select 
          class="w-full p-2 border rounded"
          bind:value={searchParams.kursform}>
          <option value="">Alle Kursformen</option>
          {#each kursformen as kf}
            <option value={kf.kfnr}>{kf.bezeichnung}</option>
          {/each}
        </select>
      </div>
      
      <div>
        <label class="block mb-2">Beginndatum</label>
        <input 
          type="date"
          class="w-full p-2 border rounded"
          bind:value={searchParams.beginndatum}>
      </div>
      
      <div>
        <label class="block mb-2">Wochentag</label>
        <select 
          class="w-full p-2 border rounded"
          bind:value={searchParams.tag}>
          <option value="">Alle Tage</option>
          <option value="Montag">Montag</option>
          <option value="Dienstag">Dienstag</option>
          <option value="Mittwoch">Mittwoch</option>
          <option value="Donnerstag">Donnerstag</option>
          <option value="Freitag">Freitag</option>
        </select>
      </div>
    </div>
    
    <div class="mb-4">
      <label class="block mb-2">Suchbegriff</label>
      <input 
        type="text"
        class="w-full p-2 border rounded"
        placeholder="Suche nach Kurstitel oder Beschreibung"
        bind:value={searchParams.suchbegriff}>
    </div>
    
    <button 
      class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      on:click={searchCourses}
      disabled={loading}>
      {loading ? 'Suche...' : 'Kurse suchen'}
    </button>
  </div>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  {#if courses.length > 0}
    <div class="grid gap-6">
      {#each courses as course}
        <div class="bg-white p-6 rounded shadow">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold">{course.kursbezeichnung}</h3>
            <button 
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              on:click={() => selectCourse(course)}>
              Anmelden
            </button>
          </div>
          
          <p class="mb-4">{course.kursbeschreibung}</p>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Dozent:</strong><br>
              {course.dozent_vorname} {course.dozent_nachname}
            </div>
            <div>
              <strong>Termine:</strong><br>
              {course.tag}, {course.anfangszeit} - {course.endzeit}
            </div>
            <div>
              <strong>Beginn:</strong><br>
              {new Date(course.beginndatum).toLocaleDateString()}
            </div>
            <div>
              <strong>Raum:</strong><br>
              {course.raum_bezeichnung}
            </div>
            <div>
              <strong>Gebühr:</strong><br>
              {course.kursgebuehr.toFixed(2)} €
            </div>
            <div>
              <strong>Fachbereich:</strong><br>
              {course.fachbereich_bezeichnung}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if !loading}
    <p class="text-center text-gray-600">Keine Kurse gefunden</p>
  {/if}
</div>
<script>
  import { onMount } from 'svelte';
  import CourseSearch from './lib/CourseSearch.svelte';
  import Registration from './lib/Registration.svelte';
  import { currentView } from './stores.js';
</script>

<main class="container mx-auto p-4">
  <nav class="mb-8 bg-gray-100 p-4 rounded">
    <button 
      class="mr-4 px-4 py-2 rounded {$currentView === 'search' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
      on:click={() => currentView.set('search')}>
      Kurssuche
    </button>
    <button 
      class="px-4 py-2 rounded {$currentView === 'registration' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
      on:click={() => currentView.set('registration')}>
      Anmeldung
    </button>
  </nav>

  {#if $currentView === 'search'}
    <CourseSearch />
  {:else}
    <Registration />
  {/if}
</main>

<style>
  :global(body) {
    font-family: Arial, sans-serif;
    line-height: 1.6;
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  
  let title = 'JuiceTokens PWA';
  
  onMount(() => {
    console.log('App mounted');
  });
</script>

<main>
  <h1>{title}</h1>
  <p>Welcome to JuiceTokens PWA</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style> 
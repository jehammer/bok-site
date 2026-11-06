<template>
  <div>
    <Navigation />
  </div>
  <main class="home-content">
    <img src="/BOKBanner.png" class="image-container" alt="Breath of Kynareth" />
  </main>
</template>
  
  <script lang="ts">
  import '../css/homepage.css';
  import Navigation from '../components/Navigation.vue';
  export default {
    components: { Navigation },
    setup() {

      return {
      }
    }
  }
</script>

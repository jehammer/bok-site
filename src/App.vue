<template>
  <div class="video-background">
    <video autoplay loop muted playsinline class="background-video">
      <source src="../assets/background.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
  <div class="app-content p-dark">
    <router-view/>
  </div>
  <notifications position="top center" max="3" />
</template>

<script setup lang="ts">
import './css/app.css';
</script>
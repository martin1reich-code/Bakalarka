<script setup lang="ts">
import { RouterView } from 'vue-router'
// Musíme naimportovat komponentu, aby byla vidět
import NotificationBell from '@/components/NotificationBell.vue'
</script>

<template>
  <div class="top-right-corner">
    <NotificationBell />
  </div>

  <RouterView />
</template>

<style>
/* === TVŮJ CSS RESET (Zachováno) === */
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #f4f6f8; /* Přidal jsem jemnou barvu pozadí pro dashboard */
  font-family: 'Arial', sans-serif;
}

#app {
  width: 100%;
  margin: 0;
  padding: 0;
  max-width: none;
}

/* === POZICOVÁNÍ ZVONEČKU === */
.top-right-corner {
  position: fixed; /* Fixní pozice = zůstane tam i při scrollování */
  top: 15px;
  right: 20px;
  z-index: 9999; /* Musí být nad vším ostatním */
}
</style>
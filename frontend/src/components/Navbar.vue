<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
            <span class="text-white text-xl font-bold">TTS</span>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">VoiceGen</span>
        </router-link>

        <div class="flex items-center gap-1">
          <NavItem to="/" label="Domů">🏠</NavItem>
          <NavItem to="/library" label="Knihovna">📚</NavItem>
          <NavItem to="/comparison" label="Porovnání">📊</NavItem>
          <NavItem to="/account" label="Účet">👤</NavItem>
          <NavItem to="/settings" label="Nastavení">⚙️</NavItem>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavItem from './NavItem.vue'

export default defineComponent({
  name: 'Navbar',
  components: { NavItem }
})
</script>

<style scoped>
nav { height: 64px }
</style>

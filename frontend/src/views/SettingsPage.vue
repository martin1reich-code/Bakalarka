<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
      <h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Nastavení</h1>
      <div class="rounded-lg bg-white/80 p-8 space-y-6">
        <div>
          <label class="block font-bold mb-2">Výchozí jazyk</label>
          <select class="border rounded p-2">
            <option>Čeština</option>
            <option>Angličtina</option>
          </select>
        </div>
        <div>
          <label class="block font-bold mb-2">Výchozí model hlasu</label>
          <select class="border rounded p-2">
            <option>google-cs-neural2-a</option>
          </select>
        </div>
        <button class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded">Uložit nastavení</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({ name: 'SettingsPage' })
</script>

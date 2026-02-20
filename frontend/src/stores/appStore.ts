import { defineStore } from 'pinia'
import { ref } from 'vue'
import appConfig from '@/config'

export const useAppStore = defineStore('app', () => {
  const library = ref<any[]>([])
  const folders = ref<any[]>([])
  
  function addToLibrary(item: any) {
    console.log('🔧 DEBUG: addToLibrary volána s:', item)
    // Ověrujeme, že item není již v knihovně
    const exists = library.value.some(lib => lib.id === item.id)
    if (!exists) {
      library.value.push(item)
      console.log('✅ Přidáno do knihovny:', item.title)
    } else {
      console.log('⚠️ Položka je již v knihovně')
    }
  }
  
  async function removeFromLibrary(id: string) {
    // Najdeme položku aby jsme znali ID
    const item = library.value.find(lib => lib.id === id)
    
    if (!item) {
      console.warn('❌ Položka nenalezena:', id)
      return
    }

    try {
      // Volíme backend pro smazání - smaže záznam z databáze A audio soubor
      const response = await fetch(`${appConfig.backendUrl}/api/tts/record/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`Chyba serveru: ${response.statusText}`)
      }

      // Smazat z paměti
      library.value = library.value.filter(lib => lib.id !== id)
      console.log('🗑️ Smazáno z knihovny a databáze')
    } catch (error) {
      console.error('❌ Chyba při mazání:', error)
      alert('Nepodařilo se smazat audio')
    }
  }
  
  console.log('📦 appStore inicializován')
  
  return {
    library,
    folders,
    addToLibrary,
    removeFromLibrary
  }
})

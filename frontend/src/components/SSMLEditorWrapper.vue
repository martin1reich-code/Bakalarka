<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, Clock, Volume2, Timer, Languages } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textareaRef = ref<HTMLTextAreaElement>()

const text = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Vložit SSML tag na pozici kurzoru
const insertTag = (before: string, after: string = '', placeholder: string = '') => {
  if (!textareaRef.value) return
  
  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  const selectedText = text.value.substring(start, end) || placeholder
  const newText = text.value.substring(0, start) + before + selectedText + after + text.value.substring(end)
  
  text.value = newText
  
  // Nastavit kurzor
  setTimeout(() => {
    if (!textareaRef.value) return
    const newPos = start + before.length + selectedText.length
    textareaRef.value.focus()
    textareaRef.value.setSelectionRange(newPos, newPos)
  }, 0)
}

const addBreak = () => {
  insertTag('<break time="500ms"/>')
}

const addEmphasis = () => {
  insertTag('<emphasis>', '</emphasis>', 'důležité')
}

const addProsody = () => {
  insertTag('<prosody rate="slow">', '</prosody>', 'text')
}

const addSayAs = () => {
  insertTag('<say-as interpret-as="date" format="dmy">', '</say-as>', '01/01/2024')
}

const wrapInSpeak = () => {
  if (!text.value.includes('<speak>')) {
    text.value = `<speak>\n${text.value}\n</speak>`
  }
}
</script>

<template>
  <div class="ssml-editor-wrapper">
    <!-- Toolbar -->
    <div class="toolbar">
      <button 
        @click="addBreak"
        class="tool-btn"
        title="Přidat pauzu"
      >
        <Clock :size="16" />
        Pauza
      </button>
      
      <button 
        @click="addEmphasis"
        class="tool-btn"
        title="Přidat důraz"
      >
        <Volume2 :size="16" />
        Důraz
      </button>
      
      <button 
        @click="addProsody"
        class="tool-btn"
        title="Změnit rychlost"
      >
        <Timer :size="16" />
        Rychlost
      </button>
      
      <button 
        @click="addSayAs"
        class="tool-btn"
        title="Formát výslovnosti"
      >
        <Languages :size="16" />
        Formát
      </button>
      
      <button 
        @click="wrapInSpeak"
        class="tool-btn"
        title="Obalit do <speak>"
      >
        <Sparkles :size="16" />
        Speak
      </button>
    </div>
    
    <!-- Editor -->
    <textarea 
      ref="textareaRef"
      v-model="text"
      class="editor-textarea"
      placeholder="Zadejte text a použijte toolbar pro přidání SSML tagů...&#10;&#10;Příklad:&#10;<speak>&#10;  Toto je <emphasis>důležité</emphasis>.&#10;  <break time='500ms'/>&#10;  A toto je normální text.&#10;</speak>"
      spellcheck="false"
    />
    
    <!-- Nápověda -->
    <div class="help-bar">
      <span class="text-xs text-gray-500">
        Vyberte text a použijte tlačítka pro přidání SSML tagů
      </span>
    </div>
  </div>
</template>

<style scoped>
.ssml-editor-wrapper {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.tool-btn:active {
  background: #e5e7eb;
}

.editor-textarea {
  width: 100%;
  min-height: 300px;
  padding: 1rem;
  border: none;
  resize: vertical;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  outline: none;
}

.editor-textarea:focus {
  outline: none;
}

.help-bar {
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
</style>

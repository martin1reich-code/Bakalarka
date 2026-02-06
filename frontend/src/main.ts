import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router' // Import routeru

import './assets/main.css' // Tvé styly

const app = createApp(App)

app.use(createPinia())
app.use(router) // Použití routeru

app.mount('#app')
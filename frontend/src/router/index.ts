import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Nový převod'
      }
    },
    {
      path: '/result',
      name: 'result',
      // Lazy-loading: Komponenta se načte až ve chvíli, kdy ji uživatel potřebuje.
      // To zrychluje načtení úvodní stránky.
      component: () => import('../views/ResultView.vue'),
      meta: {
        title: 'Výsledek převodu'
      }
    },
/*
    // --- Další plánované cesty podle tvého zadání ---
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue'), // Zatím neexistuje, nutno vytvořit
      meta: { title: 'Knihovna nahrávek' }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/StatsView.vue'), // Zatím neexistuje
      meta: { title: 'Statistiky a modely' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'), // Zatím neexistuje
      meta: { title: 'Nastavení' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'), // Zatím neexistuje
      meta: { title: 'Přihlášení' }
    }*/

  ]
})

// Globální Guard (volitelné): Nastavení titulku stránky v prohlížeči
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | TTS App` || 'TTS App';
  next();
});

export default router
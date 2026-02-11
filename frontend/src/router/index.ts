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
      component: () => import('../views/ResultView.vue'),
      meta: {
        title: 'Výsledek převodu'
      }
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryPage.vue'),
      meta: {
        title: 'Knihovna nahrávek'
      }
    },
    {
      path: '/comparison',
      name: 'comparison',
      component: () => import('../views/ComparisonPage.vue'),
      meta: {
        title: 'Porovnání modelů'
      }
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountPage.vue'),
      meta: {
        title: 'Uživatelský účet'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsPage.vue'),
      meta: {
        title: 'Nastavení'
      }
    }
  ]
})

// Globální Guard (volitelné): Nastavení titulku stránky v prohlížeči
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | TTS App` || 'TTS App';
  next();
});

export default router
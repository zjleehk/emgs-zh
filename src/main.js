import '@khmyznikov/pwa-install'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'
import DigitalId from './views/DigitalId.vue'
import IkadQr from './views/IkadQr.vue'
import PanelClinic from './views/PanelClinic.vue'
import CheckIn from './views/CheckIn.vue'
import CheckInHistory from './views/CheckInHistory.vue'
import ApplicationHistory from './views/ApplicationHistory.vue'
import ApplyVisa from './views/ApplyVisa.vue'
import ExpiredCards from './views/ExpiredCards.vue'
import Feedback from './views/Feedback.vue'
import Docs from './views/Docs.vue'
import Notifications from './views/Notifications.vue'
import { authService } from './services/auth.js'

if ('serviceWorker' in navigator) {
  let hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return }
    location.reload()
  })
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      const check = () => reg.update().catch(() => {})
      check()
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
    }).catch(() => {})
  })
}

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/home', component: Home },
  { path: '/profile', component: Profile },
  { path: '/digital-id', component: DigitalId },
  { path: '/ikad-qr', component: IkadQr },
  { path: '/emgs-panel-clinic', component: PanelClinic },
  { path: '/post-arrival-checkin', component: CheckIn },
  { path: '/checkin-history', component: CheckInHistory },
  { path: '/application-history', component: ApplicationHistory },
  { path: '/apply-visa', component: ApplyVisa },
  { path: '/expired-cards', component: ExpiredCards },
  { path: '/feedback', component: Feedback },
  { path: '/faq', component: Docs, props: { kind: 'faq' } },
  { path: '/terms', component: Docs, props: { kind: 'terms' } },
  { path: '/privacy', component: Docs, props: { kind: 'privacy' } },
  { path: '/notifications', component: Notifications },
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  const authed = authService.loggedIn
  if (to.path !== '/login' && !authed) return '/login'
  if (to.path === '/login' && authed) return '/home'
})

createApp(App).use(router).mount('#app')

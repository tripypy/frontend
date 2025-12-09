import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const authStore = useAuthStore()

// Wait for the initial token refresh to complete before mounting the app
authStore.refreshAccessToken().then(() => {
  // Navigation Guard
  router.beforeEach((to, from, next) => {
    // authStore must be instantiated inside the guard
    // because it's not available globally until Pinia is initialized.
    const guardAuthStore = useAuthStore()
    const protectedRoutes = ['trips', 'trip-detail', 'create-trip', 'log', 'settings']
    const publicOnlyRoutes = ['login', 'signup', 'find-account']

    const isProtected = protectedRoutes.includes(to.name as string)

    if (isProtected && !guardAuthStore.isLoggedIn) {
      alert('로그인 후 이용해 주세요.')
      next({ name: 'login' })
    } else if (publicOnlyRoutes.includes(to.name as string) && guardAuthStore.isLoggedIn) {
      next({ name: 'home' })
    } else {
      next()
    }
  })

  app.mount('#app')
})

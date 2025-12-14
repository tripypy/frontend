import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()

await authStore.initializeAuth()

router.beforeEach((to, from, next) => {
  if (!authStore.isInitialized) {
    return next(false)
  }

  const protectedRoutes = ['trips', 'trip-detail', 'create-trip', 'log', 'settings']
  const publicOnlyRoutes = ['login', 'signup', 'find-account']

  const isProtected = protectedRoutes.includes(to.name as string)

  if (isProtected && !authStore.isLoggedIn) {
    alert("로그인 후 이용해주세요.")
    return next({ name: 'login' })
  }

  if (publicOnlyRoutes.includes(to.name as string) && authStore.isLoggedIn) {
    return next({ name: 'home' })
  }

  next()
})

app.mount('#app')
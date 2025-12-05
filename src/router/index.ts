import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TripView from '@/views/TripView.vue'
import CreateTripView from '@/views/CreateTripView.vue'
import SearchView from '@/views/SearchView.vue'
import LogView from '@/views/LogView.vue'
import TripDetailView from '@/views/TripDetailView.vue'
import LoginView from '@/views/LoginView.vue' // 이 import를 추가합니다.

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/trips',
      name: 'trips',
      component: TripView,
    },
    {
      path: '/create-trip',
      name: 'create-trip',
      component: CreateTripView,
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/trip/:id',
      name: 'trip-detail',
      component: TripDetailView,
      props: true, // URL 파라미터를 props로 전달
    },
    {
      path: '/log',
      name: 'log',
      component: LogView,
    },
    { // 이 라우트를 추가합니다.
      path: '/login',
      name: 'login',
      component: LoginView
    },
  ],
})

export default router


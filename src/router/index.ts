import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TripView from '@/views/TripView.vue'

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
      component: TripView, // TripsPage 대신 TripView 사용
    },
    // {
    //   path: '/search',
    //   name: 'search',
    //   component: () => import('../views/SearchView.vue') // 필요시 추가
    // }
  ],
})

export default router

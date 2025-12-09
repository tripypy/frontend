import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/trips',
      name: 'trips',
      component: () => import('@/views/TripView.vue'),
    },
    {
      path: '/create-trip',
      name: 'create-trip',
      component: () => import('@/views/TripPlanView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: () => import('@/views/TripPlanView.vue'),
    },
    {
      path: '/log',
      name: 'log',
      component: () => import('@/views/LogView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUpView.vue'),
    },
    {
      path: '/find-account',
      name: 'find-account',
      component: () => import('@/views/FindAccountInfoView.vue'),
    },
  ],
})

export default router
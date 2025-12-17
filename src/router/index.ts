import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login', 
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/home', 
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true } // 인증 필요 표시
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
      path: '/log/:userId',
      name: 'user-log',
      component: () => import('@/views/LogView.vue'),
      props: true
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
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    // 기존의 '/login' 경로가 '/'로 대체되었으므로, 별도로 중복하여 정의하지 않습니다.
    // 만약 `/login`으로도 접근이 필요하다면, 아래와 같이 추가할 수 있습니다.
    
    {
        path: '/login',
        component: () => import('@/views/LoginView_before.vue'),
    }
    
  ],
})

export default router
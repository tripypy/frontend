import { createRouter, createWebHistory } from 'vue-router'
// 1. 뷰 컴포넌트들을 import 합니다.
import HomeView from '../views/HomeView.vue'
import TripView from '../views/TripView.vue'
import CreateTripView from '../views/CreateTripView.vue' // 👈 추가됨
// import TripDetailView from '../views/TripDetailView.vue' // 👈 추가됨

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
    // 👇 2. 여행 계획 생성 페이지 라우트 추가
    {
      path: '/create-trip',
      name: 'create-trip',
      component: CreateTripView,
    },
    // 👇 3. 여행 상세 페이지 라우트 추가 (:id 파라미터)
    // {
    //   path: '/trip/:id',
    //   name: 'trip-detail',
    //   component: TripDetailView,
    //   props: true, // URL 파라미터를 props로 전달
    // },
  ],
})

export default router

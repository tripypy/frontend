// src/types/trip.ts

export interface Place {
  id: number
  name: string
  address: string
  category: string
  lat: number
  lng: number
  phone?: string // 선택적 속성 (?)
  url?: string // 선택적 속성 (?)
}

export interface DayPlan {
  dayNumber: number
  places: Place[]
}

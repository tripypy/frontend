<!-- src/components/TravelNavbar.vue -->
<template>
  <nav class="fixed top-0 left-0 right-0 bg-white border-b-[2px] border-[#2C2C2C] z-50">
    <div class="max-w-[1600px] mx-auto px-8 py-3.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-12">
          <h1 
            class="text-4xl cursor-pointer font-black tracking-tighter hover:scale-105 transition-transform font-sans"
            @click="emit('navigate', 'main')"
          >
            TRAVEL<span class="text-[#9BCCC4]">.</span>
          </h1>

          <div class="flex items-center gap-1.5">
            <button
              v-for="menu in menus"
              :key="menu.id"
              @click="emit('navigate', menu.id as 'main' | 'search')"
              :class="[
                'flex items-center gap-2 px-4 py-2 border-[2px] rounded-full font-black text-xs tracking-tight transition-all uppercase',
                currentPage === menu.id 
                  ? 'bg-[#2C2C2C] text-white border-[#2C2C2C] shadow-[2px_2px_0px_0px_rgba(44,44,44,1)]' 
                  : 'bg-white border-[#2C2C2C] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
              ]"
            >
              <component :is="menu.icon" class="w-4 h-4" stroke-width="2.5" />
              <span>{{ menu.label }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button class="relative w-10 h-10 bg-white border-[2px] rounded-full border-[#2C2C2C] hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] hover:translate-x-[-1px] hover:translate-y-[-1px] flex items-center justify-center transition-all">
            <Bell class="w-4 h-4" stroke-width="2.5" />
            <span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#E88555] border-[2px] border-white rounded-full"></span>
          </button>
          
          <div class="w-10 h-10 bg-white border-[2px] rounded-full border-[#2C2C2C] overflow-hidden cursor-pointer hover:shadow-[2px_2px_0px_0px_rgba(44,44,44,0.8)] transition-all">
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="profile" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Home, Search, Map, PenTool, Bell } from 'lucide-vue-next';

defineProps<{
  currentPage: 'main' | 'search';
}>();

const emit = defineEmits<{
  (e: 'navigate', page: 'main' | 'search'): void;
}>();

const menus = [
  { id: 'main', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'trips', label: 'Trips', icon: Map },
  { id: 'write', label: 'Write', icon: PenTool },
];
</script>

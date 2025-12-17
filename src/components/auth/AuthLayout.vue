<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">

    <div class="w-full max-w-6xl">
      <h1
        class="text-6xl cursor-pointer tracking-tighter transition-transform text-white font-bold"
      >
        <span class="bg-black px-3 pr-6 rounded-tl-md rounded-tr-full">TRAVEL<span class="text-[#9BCCC4]">.</span></span>
      </h1>
    </div>

    <div class="w-full border-4 border-gray-800 max-w-6xl min-h-[65vh] bg-white rounded-b-2xl rounded-tr-2xl shadow-black shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden md:flex">
      
      <div class="md:w-1/2 p-8 relative"> 
        <div class="w-full h-full border border-gray-500 shadow-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-xl relative">
          
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
            <AuthSlider :slides="slides" />
          </div>

        </div>
      </div>

      <div class="md:w-1/2 p-10 flex flex-col justify-center">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthSlider from '@/components/auth/AuthSlider.vue'
import sliderImg1 from '@/assets/slider-img1.png';
import sliderImg2 from '@/assets/slider-img2.png';


// 슬라이더 항목의 타입을 정의합니다.
interface SlideItem {
    // 텍스트를 분리합니다.
    textBeforeHighlight: string;
    highlightWord: string; // 강조할 키워드
    textAfterHighlight: string;
    content: string;
    image: string; 
}

const slides: SlideItem[] = [
    { 
        content: '여행 계획부터 여행 일기까지,', 
        textBeforeHighlight: '당신의 여행을',
        highlightWord: '한 곳에', 
        textAfterHighlight: '정리해보세요.',
        image: sliderImg1
    },
    { 
        content: '팔로우한 사람들의 여행 일지를 살펴보고,', 
        textBeforeHighlight: '요즘 ',
        highlightWord: '핫한 여행지',
        textAfterHighlight: '를 확인해보세요.',
        image: sliderImg2
    },
];
</script>
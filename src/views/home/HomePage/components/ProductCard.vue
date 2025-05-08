<template>
  <div ref="wrapper" class="wrapper">
    <div class="contentCard debug">
      <div v-for="index in 7" :key="index">
        <img :src="`/img/HomePage/productCard/card0${index}.png`" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100vh;
  .contentCard {
    .img {
      img {
        max-width: 100%; // ✅ 限制圖片不超過容器寬
        height: auto;
        display: block; // 避免意外空白
      }
    }
  }
}
</style>

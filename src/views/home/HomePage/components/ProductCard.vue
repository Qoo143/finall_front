<template>
  <div ref="wrapper" class="wrapper">
    <div class="contentCard debug">
      <div v-for="index in 6" :key="index">
        <img :src="`/img/HomePage/productCard/card0${index}.png`" />
      </div>
    </div>

    <div class="linkButton">
      <span>
        <span>+</span>
        前往瀏覽
      </span>
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
  // 此處不限制寬
  height: 100vh;

  .contentCard {
    display: flex;
    img {
      object-fit: cover;
      width: 500px; // ✅ 限制圖片不超過容器寬
      display: block; // 避免意外空白
    }
  }
}
</style>

<template>
  <div class="wrapper">
    <button @click="isShow = !isShow">test</button>
    <div style="height: 1000px"></div>

    <div ref="animatedElement" v-if="isShow" class="testP"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // 導入 ScrollTrigger

const isShow = ref(true);
//vue-animation
const animatedElement = ref();
gsap.registerPlugin(ScrollTrigger);
onMounted(() => {
  // 使用 ref 引用而不是 querySelector
  if (animatedElement.value) {
    // 設置滾動觸發動畫
    gsap.from(animatedElement.value, {
      x: -150,
      opacity: 0,
      duration: 2,
      scrollTrigger: { trigger: animatedElement.value }, // 必須指定觸發元素
    });
  }
});
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 1000%;
  background-color: $primary-b-ll;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  button {
    margin-top: 50px;
    padding: 10px 10px 10px 10px;
    font-size: 16px;
    height: 32px;
    width: 64px;
    line-height: 0.8;
    position: absolute;
    left: 150px;
    top: 150px;
  }
  .testP {
    width: 100px;
    height: 100px;
    border: 2px solid red;
  }
}
</style>

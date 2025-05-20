<template>
  <div ref="welcome" class="welcome">
    <div ref="welcomeContent" class="welcomeContent">
      <p>每一次啟動，都是對未知的探索</p>
      <p>每一次轉向，都是對傳統的挑戰</p>
      <p>不追求速度與距離，而是創造全新的存在方式</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
const welcome = ref();
const welcomeContent = ref();

onMounted(() => {
  const lines = welcomeContent.value.querySelectorAll("p"); // 抓所有段落

  const tl = gsap.timeline().from(lines, {
    y: 100,
    opacity: 0,
    duration: 1.1,
    ease: "back.out(1.2)",
    stagger: 0.2,
  });

  ScrollTrigger.create({
    trigger: welcome.value,
    start: "top 75%",
    animation: tl,
    // markers: true,
    toggleActions: "play none none reset",
  });
});
</script>

<style scoped lang="scss">
.welcome {
  width: 100%;
  height: 40vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $bg-3;

  .welcomeContent {
    font-size: 2rem;
    height: 20vh;
    width: 50%;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    p {
      color: $text-d;
      font-size: 1.5rem;
    }
  }
}
</style>

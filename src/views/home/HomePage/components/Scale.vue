<template>
  <div ref="wrapper debug" class="wrapper">
    <div ref="content" class="content">
      <!-- <img src="/img/HomePage/Scale/Scale-1.png" alt="" /> -->
      <img
        v-for="index in 7"
        :key="index"
        :src="`/img/HomePage/Scale/Scale-${index}.png`"
        :class="('debug', { active: index === activeIndex })"
      />
    </div>
    <div ref="blackSection" class="blackSection">
      <p ref="firstP" class="firstP">Kindness-driven design</p>
      <p ref="secondP" class="secondP">Where empathy meets innovation.</p>
      <p ref="thirdP" class="thirdP">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero minima
        consequatur rerum quia, iusto voluptatum sint officiis nam nesciunt nisi
        enim, ducimus tempora, reprehenderit aliquid necessitatibus labore
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const activeIndex = ref(1); // 當前顯示的圖片索引
const wrapper = ref(); //控制框
const content = ref(); //控制圈
const blackSection = ref(); //黑色文字區
const firstP = ref();
const secondP = ref();
const thirdP = ref();
onMounted(() => {
  // 創建主時間軸 - 處理放大效果
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper.value,
      start: "top top",
      end: "+=2000",
      pin: true,
      pinSpacing: true, // 確保創建空間
      scrub: 1, // 平滑滾動效果，值越大越平滑
      // markers: true,
    },
  });

  // 第一階段：放大內容到填滿螢幕 (同時切換圖片1-3)
  mainTl.to(content.value, {
    width: "100vw",
    height: "100vh",
    borderRadius: "0px",
    duration: 0.5, // 時間軸上的相對位置
    ease: "none",
    onUpdate: function () {
      // 根據動畫進度更新圖片
      const progress = this.progress(); // 0-1之間
      if (progress < 0.25) {
        activeIndex.value = 1;
      } else if (progress < 0.66) {
        activeIndex.value = 2;
      } else {
        activeIndex.value = 3;
      }
    },
  });

  // 第二階段：保持全屏並切換圖片4-7
  mainTl.to(
    {},
    {
      duration: 0.5, // 時間軸上的相對位置
      ease: "none",

      onUpdate: function () {
        const progress = this.progress(); // 0-1之間
        if (progress < 0.25) {
          activeIndex.value = 4;
        } else if (progress < 0.5) {
          activeIndex.value = 5;
        } else if (progress < 0.75) {
          activeIndex.value = 6;
        } else {
          activeIndex.value = 7;
        }
      },
    }
  );

  //第三階段 : 黑圖滑上來
  mainTl.to(
    blackSection.value,
    {
      top: "0%", // 從 top: 100% 滑到 top: 0%
      duration: 0.5,
      ease: "power1.inOut",
    },
    ">+0.2" // 在前一段動畫後稍作延遲再執行
  );

  // 創建主時間軸 - 文字浮動
  const textTl = gsap.timeline({
    scrollTrigger: {
      trigger: blackSection.value,
      start: "bottom 30%",
      markers: true,
    },
  });
  textTl.from([firstP.value], {
    xPercent: -100,
    duration: 0.5,
    opacity: 0,
    ease: "power1.inOut",
  });
  textTl.from(
    [secondP.value],
    {
      xPercent: 100,
      duration: 0.5,
      opacity: 0,
      ease: "power1.inOut",
    },
    "<+=0.2"
  );
  textTl.from(
    [thirdP.value],
    {
      opacity: 0,
      yPercent: 100,
      duration: 0.7,
      ease: "power1.in",
    },
    "<+=0.5"
  );
});
</script>

<style scoped lang="scss">
.wrapper {
  max-width: 100%;
  width: 100%;
  height: 100vh;
  background-color: $bg-3;
  position: relative;

  .content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: 50% 50%;

    width: 60%;
    height: 500px;
    min-width: 800px;

    border-radius: 500px;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;
    will-change: width, height;
    img {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover; // ✅ 圖片填滿容器又不變形
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
      transition: opacity 0.5s ease;
    }

    img.active {
      opacity: 1;
      z-index: 1;
    }
  }
  .blackSection {
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 3;
    background-color: rgb(18, 21, 36);
    color: $text-ll;
    padding: 6rem 3rem 6rem 0;
    overflow: hidden;
    font-family: "Helvetica Neue", sans-serif;
    .firstP {
      font-size: 10rem;
    }
    .secondP {
      font-size: 5rem;
    }
    .thirdP {
      opacity: 1;
      position: absolute;
      font-size: 1.5rem;
      width: 800px;
      right: 0;
      bottom: 6rem;
      background-color: #313053;
      padding: 3rem 5rem;
    }
  }
}

//切換顯示圖片用
.wrapper .content img.active {
  opacity: 1;
}
</style>

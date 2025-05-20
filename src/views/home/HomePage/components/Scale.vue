<template>
  <div ref="wrapper" class="wrapper">
    <div ref="content" class="content">
      <!-- <img src="/img/HomePage/Scale/Scale-1.png" alt="" /> -->
      <img
        v-for="index in 7"
        :key="index"
        :src="`/img/HomePage/Scale/Scale-${index}.png`"
        :class="{ active: index === activeIndex }"
      />
    </div>
    <div ref="blackSection" class="blackSection">
      <p ref="firstP" class="firstP">善念驅動設計</p>
      <p ref="secondP" class="secondP">體驗以人為本的未來出行</p>
      <p ref="thirdP" class="thirdP">
        我們深信科技應該服務於人性而非相反<br />
        每一條線條、每一個界面、每一次互動，都經過精心設計<br />
        不僅是為了展現未來感，更是為了讓科技融入生活的自然節奏<br />
        我們不只打造交通工具，而是創造與使用者共同成長
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
  /**
   * 放大、換圖片動畫
   */
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper.value,
      start: "top top",
      end: "+=200%",
      pin: true,
      pinSpacing: true,
      scrub: 1,
      // markers: true,
      immediateRender: false, // 確保動畫只有在滾動開始後才執行
    },
  });

  // 第一階段：放大內容到填滿螢幕 (切換圖片1-3)
  mainTl.to(content.value, {
    width: "100%",
    height: "100%",
    borderRadius: "0px",
    duration: 1, // 相對時間軸上的持續時間，佔比更大
    ease: "power1.inOut",
    onStart: () => {
      activeIndex.value = 1; // 確保開始時是第一張
    },
    onUpdate: function () {
      // 在放大過程中只切換前3張
      const progress = this.progress(); // 0-1之間
      if (progress < 0.33) {
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
      duration: 1, // 相對時間軸上分配更多時間給圖片切換
      ease: "none",
      onStart: () => {
        // 確保這階段從第4張開始
        activeIndex.value = 4;
      },
      onUpdate: function () {
        // 這裡的進度是針對這一個動畫段落的
        const progress = this.progress();
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

  // 第三階段：黑色部分滑上來
  mainTl.to(blackSection.value, {
    top: 0,
    duration: 0.5, // 相對較短的持續時間
    ease: "power1.inOut",
    onStart: () => {
      // 當黑色區塊滑到位置後，創建文字動畫
      createTextAnimation();
    },
  });

  /**
   *  文字動畫
   */
  const createTextAnimation = () => {
    // 黑色區塊滑入完成後，立即開始文字動畫
    const textTl = gsap.timeline();

    textTl
      .from(
        firstP.value,
        {
          autoAlpha: 0,
          x: 50, // 假設初始有偏移
          duration: 0.5,
          ease: "power2.out",
        },
        "0.5"
      )
      .from(
        secondP.value,
        {
          autoAlpha: 0,
          x: -50,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      )
      .from(
        thirdP.value,
        {
          autoAlpha: 0,
          y: 100,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.2"
      );
  };
});
</script>

<style scoped lang="scss">
.wrapper {
  max-width: 100vw;
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
    height: 100%;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 3;
    background-color: rgb(18, 21, 36);
    color: $text-ll;
    display: grid; // 使用Grid布局
    grid-template-columns: 1fr; // 單列布局
    grid-template-rows: auto auto 1fr; // 根據內容自動分配高度
    gap: 2rem; // 設置間距
    padding: 6rem; // 統一的padding
    box-sizing: border-box;
    overflow: hidden;
    font-family: "Helvetica Neue", sans-serif;
    .firstP {
      font-size: 10rem;
    }
    .secondP {
      font-size: 5rem;
      color: $primary-b-ll;
    }
    .thirdP {
      grid-column: 1; // 指定列
      grid-row: 3; // 指定行
      align-self: end; // 底部對齊
      justify-self: end; // 右側對齊
      max-width: 800px;
      width: 100%;
      background-color: #313053;
      padding: 3rem;
      box-sizing: border-box;
      margin-bottom: 6rem; // 使用margin代替絕對定位
    }
  }
}

//切換顯示圖片用
.wrapper .content img.active {
  opacity: 1;
}
</style>

<template>
  <div ref="wrapper" class="wrapper">
    <!-- 車車背景 -->
    <img class="carBack" src="/img/HomePage/carHead/carBack.svg" alt="" />
    <!-- 車車本體 -->
    <div class="demoCar">
      <img
        ref="wheel_front"
        class="wheel_front"
        src="/img/HomePage/carHead/wheel_front.png"
      />

      <img
        ref="wheel_end"
        class="wheel_end"
        src="/img/HomePage/carHead/wheel_end.png"
      />

      <img ref="carA" class="carA" src="/img/HomePage/carHead/carA.png" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const carA = ref();
const wheel_front = ref();
const wheel_end = ref();
const wrapper = ref();

onMounted(() => {
  document.body.style.overflow = "hidden";
  if (carA.value && wheel_front.value && wheel_end.value && wrapper.value) {
    const tl = gsap.timeline();

    // ✅ 1. 初始進場動畫（車子+輪子進場並轉動）
    tl.from(carA.value, {
      x: 1500,
      duration: 1.5,
      ease: "back(0.7)",
    });

    tl.from(
      [wheel_front.value, wheel_end.value],
      {
        x: 1500,
        rotation: 360 * 3, // 輪子旋轉3圈
        duration: 1.5,
        ease: "back(0.7)",
      },
      0 // 同時開始
    );

    // ✅ 2. 動畫播放完成後，啟用 scroll 動畫
    tl.eventCallback("onComplete", () => {
      // ✅ 解鎖滾動
      document.body.style.overflow = "auto";
      // 車子向左開走
      const moveCar = gsap.to(carA.value, {
        x: -1300,
      });

      // 輪子再轉動（跟著車子離場轉動）
      const rotateWheels = gsap.to([wheel_front.value, wheel_end.value], {
        x: -1300,
        rotation: "-=720",
      });

      // ScrollTrigger 控制離場動畫
      ScrollTrigger.create({
        trigger: wrapper.value,
        start: "top top",
        end: "+=900",
        scrub: true,
        animation: moveCar,
      });

      ScrollTrigger.create({
        trigger: wrapper.value,
        start: "top top",
        end: "+=900",
        scrub: true,
        animation: rotateWheels,
      });
    });
  }
});
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden; // gsap會造成撐開
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .demoCar {
    position: absolute;
    left: 50%;
    top: 39%;
    width: 700px;
    transform: translateX(-50%);

    .wheel_front,
    .wheel_end {
      position: absolute;
      width: 100px;
      height: 100px;
      transform-origin: center;
      z-index: 2;
    }

    .wheel_front {
      left: 120px; // 依據 carA 的寬度（700px）手動對齊輪子位置
      top: 235px;
    }

    .wheel_end {
      left: 497px;
      top: 233px;
    }
    .carA {
      position: relative;
      left: 50%;
      transform: translateX(-50%);
      top: 35%;
      width: 700px;
      height: 50%;
      z-index: 1;
    }
  }
  .carBack {
    position: absolute;
    left: 0;
    height: 0;
    width: 100%;
    height: 100vh;
  }
}
</style>

<template>
  <div ref="wrapper" class="wrapper">
    <div class="carText">
      <p ref="carText1">這不只是車是你與未來的連結</p>
      <p ref="carText2">未來不再等待</p>
      <p ref="carText3">開啟未來視野 駕馭智能生活</p>
    </div>

    <!-- 車車背景 -->
    <img class="carBack" src="/img/HomePage/carHead/carBack.png" alt="" />
    <p ref="qianTa" class="qianTa">QianTa</p>

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
import { useScrollLock } from "@/utils/useScrollLock";
// 使用滾動鎖定 Hook
const { lockScroll, unlockScroll } = useScrollLock();

gsap.registerPlugin(ScrollTrigger);
const carA = ref(); //車子本體
const wheel_front = ref(); //前輪
const wheel_end = ref(); //後輪
const wrapper = ref(); //外層(建立滾動)
const carText1 = ref();
const carText2 = ref();
const carText3 = ref();
const qianTa = ref();

onMounted(() => {
  //強制回到最上面
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto", // 使用 'auto' 而不是 'smooth' 以確保立即滾動
  });
  // 鎖定滾動
  lockScroll();

  if (wrapper.value) {
    const tl = gsap
      .timeline()
      // 1. 初始進場動畫
      .from(carA.value, {
        x: 1500,
        duration: 1.5,
        ease: "back(0.7)",
      })
      .from(
        [wheel_front.value, wheel_end.value],
        {
          x: 1500,
          rotation: 360 * 3, // 輪子旋轉3圈
          duration: 1.5,
          ease: "back(0.7)",
        },
        0
      )
      .from(
        carText1.value,
        {
          opacity: 0,
          x: 50,
          duration: 0.7,
          ease: "back()",
        },
        "-=0.3"
      )
      .from(
        carText2.value,
        {
          opacity: 0,
          x: -50,
          duration: 0.7,
          ease: "back()",
        },
        "-=0.5"
      )
      .from(
        carText3.value,
        {
          y: 50,
          opacity: 0,
          duration: 0.7,
          ease: "back()",
        },
        "-=0.1"
      )
      .from(
        qianTa.value,
        {
          y: -150,
          opacity: 0,
          duration: 1,
          ease: "back()",
        },
        "-=0.9"
      );

    //  動畫播放完成後，啟用 scroll 動畫
    tl.eventCallback("onComplete", () => {
      // 解鎖滾動
      unlockScroll();

      // 車子向左開走
      const moveCar = gsap
        .timeline()
        .to(carA.value, {
          x: -1300,
          ease: "none",
        })
        .to(
          [wheel_front.value, wheel_end.value],
          {
            x: -1300,
            ease: "none",
            rotation: "-=720",
          },
          0
        );
      const moveText = gsap.to(
        [carText1.value, carText2.value, carText3.value, qianTa.value],
        {
          opacity: 0,
          y: -50,
          ease: "none",
        },
        0
      );

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
        end: "+=150",
        scrub: true,
        animation: moveText,
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
  .carText {
    position: absolute;
    left: 50%;
    top: 30%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 2rem;
    color: aliceblue;
    p {
      color: $primary-y;
      font-weight: 900;
      margin-bottom: 1rem;
    }
    p:nth-of-type(2) {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      color: $primary-b-ll;
      font-weight: 900;
    }
    p:nth-of-type(3) {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      color: $primary-b-ll;
      font-weight: 900;
    }
  }
  .qianTa {
    font-size: 20rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 35%;
    color: rgba(201, 185, 41, 0.281);
    font-weight: 900;
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

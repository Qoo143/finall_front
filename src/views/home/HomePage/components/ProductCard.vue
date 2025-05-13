<template>
  <!-- 外層容器，用於定位和設置視窗 -->
  <div ref="wrapper" class="wrapper">
    <!-- 內層容器，包含所有照片並可超出螢幕 -->
    <div ref="horizontalScroll" class="horizontalScroll">
      <!-- 照片項目 -->
      <div ref="contentCard" class="contentCard">
        <!-- 照片卡片 -->
        <div v-for="index in 6" :key="index" class="card scroll-card">
          <img :src="`/img/HomePage/productCard/card0${index}.png`" />

          <p class="firstP">
            {{ productCardText[index - 1].title }}
          </p>
          <p class="secondP">
            {{ productCardText[index - 1].text }}
          </p>
        </div>
      </div>
      <!-- 此按鈕只是一個點，用偽元素寫 -->
      <div class="wrapperBtn">
        <div class="linkButton">
          <span href=""></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const wrapper = ref(); //整個外框 監聽用
const horizontalScroll = ref(); //要做動的區塊
const contentCard = ref(); //卡片本體框

//準備文字檔
const productCardText = [
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
  {
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias, ducimus.",
  },
];

onMounted(() => {
  const contentCardWidth = contentCard.value.offsetWidth;
  const screenWidth = window.innerWidth;

  // 1. 設置水平滾動動畫
  const horizonAnimate = gsap.timeline();
  horizonAnimate.to(contentCard.value, {
    x: -(contentCardWidth - screenWidth),
  });

  // 主 ScrollTrigger 用於控制水平滾動
  ScrollTrigger.create({
    trigger: wrapper.value,
    start: "top top",
    end: () => `+=${contentCardWidth - screenWidth}`,
    scrub: 1,
    pin: true,
    animation: horizonAnimate,
  });

  // 獲取所有卡片
  const cards = gsap.utils.toArray(".scroll-card") as HTMLElement[];

  // 2. 為每個卡片單獨設置動畫
  cards.forEach((card, index) => {
    const firstP = card.querySelector(".firstP");
    const secondP = card.querySelector(".secondP");

    if (!firstP || !secondP) return;

    // 創建卡片動畫（完全獨立的時間線）
    const cardAnimation = gsap.timeline({
      paused: true, // 暫停狀態，等待觸發
      defaults: { duration: 0.5, ease: "power2.out" },
    });

    // 設置動畫
    cardAnimation
      .to(firstP, { opacity: 1, y: -130 })
      .to(secondP, { opacity: 1, y: -190 }, "-=0.3"); // 稍微重疊以產生連續效果

    // 3. 創建觀察器，監控卡片位置 //ai生成 //原生window視窗監聽
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 當卡片進入視窗時播放動畫，離開時反轉
          if (entry.isIntersecting) {
            cardAnimation.play();
          } else {
            cardAnimation.reverse();
          }
        });
      },
      {
        root: null, // 視窗
        threshold: 0.3, // 當卡片有30%進入視窗時觸發
        rootMargin: "0px", // 可調整觸發位置
      }
    );

    // 開始觀察卡片
    observer.observe(card);
  });
});


</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: rgb(18, 21, 36);
  overflow-x: hidden; //隱藏滾軸

  .horizontalScroll {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .contentCard {
      position: absolute;
      top: 6%; // 垂直置中
      display: flex; // 使用flex水平排列
      padding: 0 10%; // 左右邊距

      .card {
        flex: 0 0 auto; // 不縮放、不伸展
        width: 1000px; // 固定寬度
        height: 650px;
        margin-right: 30px; // 照片
        border-radius: 5rem;
        overflow: hidden;
        position: relative;

        img {
          width: 100%;
          height: 100%; // 加這行
          object-fit: cover;
          border-radius: 8px;
          transition: scale 0.3s ease;
          &:hover {
            scale: 1.05;
          }
        }

        .firstP {
          font-size: 3rem;
          color: aliceblue;
          position: absolute;
          left: 5rem;
          bottom: 5rem;
        }
        //一開始在外部
        .secondP {
          font-size: 2rem;
          color: aliceblue;
          position: absolute;
          left: 5rem;
          bottom: -8rem;
          width: 500px;
        }
      }
    }
    .wrapperBtn {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 2.5rem;
      width: 180px;
      height: 55px;

      

      .linkButton {
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.25s ease;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: $primary-b-d;
        border-radius: 1rem;
        cursor: pointer;

        span {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(0deg);
          transition: all 0.5s ease;
          perspective: 800px; // 加上透視，才有 3D 效果

          &::before,
          &::after {
            position: absolute;
            content: "";
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;

            display: flex;
            align-items: center;
            justify-content: center;
            backface-visibility: hidden; // 一定要加
          }
          &::before {
            content: "前往購物";
            color: white;
            // background-color: pink;
            transform: rotateY(0) translateZ(25px);
            font-weight: 500;
            font-size: 1rem;
            // background-color: $primary-b-d;
          }
          &::after {
            content: "給我點下去";
            color: white;
            // background-color: $primary-b-l;
            transform: rotateX(90deg) translateZ(25px);
          }
          &:hover {
            transform: translateZ(-25px) rotateX(-90deg);
          }
        }
      }
    }
  }
}
</style>

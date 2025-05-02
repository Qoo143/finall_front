<template>
  <div class="wrapper">
    <!-- 登入註冊視窗 -->

    <!-- --------------------<<包裝動畫>>-------------------- -->
    <router-view v-slot="{ Component, route }">
      <transition name="route" mode="out-in" appear>
        <div class="container" :key="route.name">
          <component :is="Component" />
        </div>
      </transition>
    </router-view>

    <!-- 底圖 + 漸層背景包一起 -->
    <div class="background">
      <div class="dynamicBackground"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 不要讓背景超出去 */

  display: flex;
  justify-content: center;
  align-items: center;

  // 底部背景圖 + 動態漸層
  .background {
    position: absolute;
    inset: 0; // top: 0; left: 0; right: 0; bottom: 0;
    background-image: url("@/assets/images/whiteLight.png");
    background-size: cover;
    background-position: center;
    z-index: 0; // 在最底層
    overflow: hidden;
  }

  // 動態漸層
  .dynamicBackground {
    position: absolute;
    inset: 0;
    opacity: 0.9;
    background: linear-gradient(
      0deg,
      rgba(155, 187, 224, 0.5),
      rgba(223, 203, 135, 0.5),
      rgba(165, 215, 230, 0.5),
      rgba(216, 167, 127, 0.5)
    );
    background-size: 400% 400%;
    animation: gradientFlow 13s ease infinite;
    z-index: 1; // 在背景圖上面，但比視窗低
  }

  // 登入與註冊routerview
  .container {
    margin: auto;
    width: 70%; // 設定為視窗寬度的 70%
    max-width: 1000px; // 最大寬度 800px
    min-width: 800px; // 最小寬度 400px
    height: 70%; // 保持高度為固定比例

    border-radius: 24px;
    z-index: 2; // 最上層
    position: relative;

    /* 毛玻璃屬性設置 */
    background-color: rgba(228, 241, 243, 0.41);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }
}
//漸變設定
@keyframes gradientFlow {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

//vue-animation
.route-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.route-enter-active {
  transition: all 0.5s ease;
}
.route-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.route-leave-active {
  transition: all 0.5s ease;
}
</style>

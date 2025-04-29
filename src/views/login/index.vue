<template>
  <div class="wrapper">
    <!-- 底圖 + 漸層背景包一起 -->
    <div class="background">
      <div class="dynamicBackground"></div>
    </div>

    <!-- 登入註冊視窗 -->
    <div class="container">
      <RouterView />
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
    width: 800px;
    height: 70%;
    border-radius: 24px;
    z-index: 2; // 最上層
    position: relative;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
</style>

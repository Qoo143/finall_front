<template>
  <div class="loginBackground">
    <!-- 大容器 -->
    <div class="loginContainer">
      <!-- 小容器 - 路由視圖 -->
      <RouterView />
    </div>
    <!-- 漸層背景 -->
    <div class="dynamicBackground"></div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<style lang="scss" scoped>
.loginBackground {
  // 背景設定
  background-image: url(../assets/images/whiteLight.png);
  background-size: cover;
  // position: absolute;
  width: 100%;
  height: 100vh;
  // z-index: -1;
  // display: flex;
  // justify-content: center;
  // align-items: center;

  //登入與註冊的路由區
  .loginContainer {
    width: 100%;
    height: 100%;

    // padding: 70px 200px;

    @media (min-width: 1536px) {
      // 2xl
      padding: 166px 520px;
    }
  }

  // 動態漸層背景
  .dynamicBackground {
    position: absolute;
    z-index: -2;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      0deg,
      rgba(155, 187, 224, 0.5),
      rgba(223, 203, 135, 0.5),
      rgba(165, 215, 230, 0.5),
      rgba(216, 167, 127, 0.5)
    );
    background-size: 400% 400%;
    animation: gradientFlow 13s ease infinite;
  }
}

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

<template>
  <header class="navbar">
    <!-- 固定寬度的導航容器 -->
    <div
      :class="{
        navbar__container: true,
        white: isProductsPage,
      }"
    >
      <!-- 左側選單 -->
      <nav class="navbar__left">
        <button @click="onClickMenu">選單</button>
        <button @click="goto('home')">首頁</button>
        <button @click="goto('ProductsPage')">商品</button>
        <button>訂單</button>
        <button>關於</button>
      </nav>

      <!-- 中間 Logo -->
      <div class="navbar__center">
        <img src="/img/QIANTA2.svg" alt="Logo" class="navbar__logo" />
      </div>

      <!-- 右側購物車 -->
      <div class="navbar__right">
        <button>購物車</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
/**
 * 跳轉
 */
const goto = (name: string) => {
  router.push(`/${name}`);
};
function onClickMenu() {
  alert("選單被點了！");
}

//判斷所在頁面變換class
// 判斷是否在商品頁面
const isProductsPage = computed(() => {
  return route.path.includes("/ProductsPage");
});
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 60px;
  background-color: transparent;
  color: white;

  // 內容容器
  &__container {
    position: relative;
    max-width: 1440px; // 設置一個最大寬度
    height: 100%;
    margin: 0 auto; // 居中
    padding: 0 1rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr; // 三列布局：左側、中間、右側
    align-items: center;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-self: start; // 靠左
  }

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-self: end; // 靠右
  }

  &__logo {
    height: 1.5rem;
  }

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 32px;
    cursor: pointer;

    &:hover {
      background-color: #414141;
    }
  }
}
//判斷路徑轉換顏色
.white {
  button {
    color: black;
    &:hover {
      background-color: $primary-b-ll;
    }
  }
}
</style>

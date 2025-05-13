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
        <button @click="openCart" class="cart-button">
          購物車
          <span v-if="cartStore.totalItems > 0" class="cart-badge">
            {{ cartStore.totalItems }}
          </span>
        </button>
        <button v-if="userStore.isLoggedIn" class="user-button">
          {{ userStore.userName }}
        </button>
        <button v-else @click="goto('login')" class="login-button">登入</button>
      </div>
    </div>

    <!-- 引入購物車側邊欄 -->
    <CartSidebar v-model:visible="cartVisible" @checkout="goCheckout" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import CartSidebar from "@/views/home/components/CartSidebar.vue"; //購物車
import { useCartStore } from "@/stores/cart";
import { useUserInfoStore } from "@/stores/user";

//使用pinia
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const userStore = useUserInfoStore();

// 控制購物車側邊欄顯示狀態
const cartVisible = ref(false);

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

/**
 * 打開購物車側邊欄
 */
const openCart = () => {
  cartVisible.value = true;
};

/**
 * 前往結帳頁面
 */
const goCheckout = () => {
  // 確認用戶已登入
  if (!userStore.isLoggedIn) {
    router.push("/login");
    return;
  }

  // 前往結帳頁面
  router.push("/checkout");
};
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
    border-radius: 0.5rem;
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
    border-radius: 0.5rem;
    background-color: #e7e7e7;

    &:hover {
      background-color: $primary-b-ll;
    }
  }
  .navbar__right {
    button {
      background-color: transparent;
      &:hover {
        background-color: $primary-b-ll;
      }
    }
  }
}
//克制icon
.custom-icon {
  font-size: 2rem;
}
</style>

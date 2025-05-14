// src/App.vue
<template>
  <div class="page">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCartStore } from "@/stores/cart";
import { useUserInfoStore } from "@/stores/user";

const cartStore = useCartStore();
const userStore = useUserInfoStore();

onMounted(async () => {
  // 當用戶已登入時，初始化購物車
  if (userStore.isLoggedIn) {
    console.log('App初始化 - 用戶已登入，初始化購物車');
    await cartStore.initCart();
    console.log('App初始化 - 購物車商品數:', cartStore.items.length);
  }
});
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  width: 100%;
}
</style>
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

onMounted(() => {
  // 當用戶已登入時，加載購物車
  if (userStore.isLoggedIn) {
    cartStore.loadCartFromLocalStorage();
  }
});
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  width: 100%;
}
</style>

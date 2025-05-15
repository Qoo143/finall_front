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
import { tokenManager } from "@/utils/tokenManager";
import { ElMessage } from "element-plus";

const cartStore = useCartStore();
const userStore = useUserInfoStore();

onMounted(async () => {
  // 1.檢查 token 是否過期
  if (userStore.token && tokenManager.isTokenExpired(userStore.token)) {
    // token 已過期，清除登入狀態
    userStore.logout();
    ElMessage.warning("登入已過期，請重新登入");
    return;
  }

  // 2.當用戶已登入時，初始化購物車
  if (userStore.isLoggedIn) {
    console.log("App初始化 - 用戶已登入，初始化購物車");
    await cartStore.initCart();
    console.log("App初始化 - 購物車商品數:", cartStore.items.length);
  }
});
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  width: 100%;
}
</style>

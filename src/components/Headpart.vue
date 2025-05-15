<template>
  <div class="head">
    <div class="logo">
      <img src="../../../../img/QIANTA-d-b.svg" alt="logo" />
    </div>
    <div class="user">
      <!-- 已登入狀態 - 顯示用戶名稱 -->
      <button v-if="isLoggedIn" class="userInfoIsLogin">
        {{ userStore.userName }}
      </button>
      
      <!-- 未登入狀態 - 顯示登入按鈕 -->
      <button @click="goLogin" v-else class="userInfoNoLogin">
        <el-icon class="user-icon" :size="24"><UserFilled /></el-icon>
        {{ "前往登入" }}
      </button>
      
      <!-- 後台頁面時顯示"前往前台"按鈕 -->
      <button v-if="isAdmin && !isHome" class="switch" @click="goToHome">
        前往前台
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useUserInfoStore } from "@/stores/user"; // Pinia 用戶信息
import { UserFilled } from "@element-plus/icons-vue"; // 引入 Element Plus 圖標
import { ElMessage } from "element-plus"; // 引入提示信息組件

// 初始化路由和 Store
const router = useRouter();
const route = useRoute();
const userStore = useUserInfoStore();

// 判斷登入狀態 - 使用 Pinia 存儲的登入狀態
const isLoggedIn = computed(() => userStore.isLoggedIn);

// 判斷是否為管理員 - 這個可以根據實際需求從用戶數據中獲取
const isAdmin = computed(() => userStore.isAdmin || true); // 應該從 userStore 獲取正確的管理員權限

// 判斷是否在前台頁面
const isHome = computed(() => route.path.startsWith("/home"));

/**
 * 頁面載入時檢查登入狀態
 */
onMounted(() => {
  // 檢查是否有需要登入權限的路由
  checkAuthRequirement();
});

/**
 * 檢查當前路由是否需要登入權限
 */
const checkAuthRequirement = () => {
  // 檢查當前路由是否需要登入權限
  const requiresAuth = route.meta.requiresAuth;
  
  // 如果路由需要登入且用戶未登入，則導航到登入頁面
  if (requiresAuth && !isLoggedIn.value) {
    ElMessage.warning("請先登入後再訪問此頁面");
    // 保存當前路徑，登入後可以返回
    router.push({ path: '/login', query: { redirect: route.fullPath } });
  }
};

/**
 * 前往登入頁面
 */
const goLogin = () => {
  // 保存當前路徑，登入後可以返回
  router.push({ path: '/login', query: { redirect: route.fullPath } });
};

/**
 * 從後台前往前台
 */
const goToHome = () => {
  router.push("/home");
};
</script>

<style scoped lang="scss">
.head {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 10px 24px;
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;
  }

  .user {
    display: flex;
    align-items: center;
    gap: 12px;

    .userInfoIsLogin {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.25rem;
      color: $primary-b-d;
      border: 1px dotted $primary-b-d;

      border-radius: 16px;
      padding: 8px 12px;
      cursor: pointer;

      &:hover {
        background-color: $primary-b-ll;
      }
    }

    .userInfoNoLogin {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.25rem;
      color: $primary-b-d;
      border: 1px dotted $primary-b-d;

      border-radius: 16px;
      padding-right: 12px;
      cursor: pointer;

      &:hover {
        background-color: $primary-b-ll;
      }
    }

    .user-icon {
      color: $primary-b-d;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .switch {
      padding: 5px 16px;
      color: $primary-b-d;
      background-color: $primary-y;
      border: none;
      border-radius: 16px;
      line-height: 1.5;
      font-size: 1.25rem;
      cursor: pointer;
    }
  }
}
</style>
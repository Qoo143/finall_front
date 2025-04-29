<template>
  <div class="head">
    <div class="logo">
      <img src="../../../../public/img/QIANTA-d-b.svg" alt="logo" />
    </div>
    <div class="user">
      <button v-if="isLogin" class="userInfoIsLogin">
        {{ userName }}
      </button>

      <button @click="goLogin" v-else class="userInfoNoLogin">
        <el-icon class="user-icon" :size="24"><UserFilled /></el-icon>
        {{ "前往登入" }}
      </button>

      <button v-if="isAdmin" class="switch" @click="goTo">
        {{ isHome ? "前往後台" : "前往前台" }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { computed, ref } from "vue";
import { useUserInfoStore } from "@/stores/user"; //pinia獲取資訊
import { storeToRefs } from "pinia";
/**
 * 使用pinia
 */
const UserInfo = useUserInfoStore();
const { userName, imageUrl } = storeToRefs(UserInfo); //保持解構出來還是響應式
/**
 * 判斷狀態
 */
const isLogin = ref(false); //先假設登入
const isAdmin = ref(true); //先假設是管理員
const isHome = computed(() => route.path.startsWith("/home")); // 判斷是否在前台

const router = useRouter(); // 切換頁面用
const route = useRoute(); // 判斷當前頁面用

/**
 * 前往登入
 */
const goLogin = () => {
  router.push("/login");
};
/**
 * 切換前台/後台
 */
const goTo = () => {
  if (isHome.value) {
    router.push("/products");
  } else {
    router.push("/home");
  }
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

<template>
  <!-- 外殼 -->
  <div class="common-wrapper">
    <!-- 內容 -->
    <div class="common-content">
      <!-- 登入註冊切換盒子 -->
      <div class="auth-wrapper">
        <!-- tab切換 -->
        <div class="tabs">
          <router-link :to="`/login`" exact-active-class="active"
            >登入</router-link
          >
          <router-link :to="`/login/register`" active-class="active"
            >註冊</router-link
          >
        </div>
        <!-- 登入與註冊切換視窗 -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.active {
  color: red;
}
</style>

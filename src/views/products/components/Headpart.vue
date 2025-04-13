<template>
  <div class="head">
    <div class="logo">
      <img src="../../../../public/img/QIANTA-d-b.svg" alt="logo" />
    </div>
    <div class="user">
      <div class="userInfo">
        <!-- <p>歡迎光臨</p> -->
        <el-icon class="user-icon" :size="24"><UserFilled /></el-icon>
        <p>Qoo143</p>
      </div>
      <button class="switch" @click="goto">前往前台</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const goto = () => {
  console.log("123");
};
</script>

<style scoped lang="scss">
.head {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 40px 24px;
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;
  }

  .user {
    display: flex;
    align-items: center;
    gap: 12px;

    .userInfo {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.25rem;
      color: $primary-b-d;
      border: 1px dotted $primary-b-d;
      border-radius: 16px;

      &:hover {
        background-color: #c4a3a3;
      }
      p {
        padding-right: 10px;
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

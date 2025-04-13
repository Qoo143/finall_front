<template>
  <div class="head">
    <div class="logo">
      <img src="../../../../public/img/QIANTA2.svg" alt="logo" />
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
  padding: 0 25px;
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
      color: #699cb9;
      border: 1px dotted;
      border-radius: 16px;
      background-color: #d6e0e2;

      &:hover {
        background-color: #c4a3a3;
      }
      p {
        padding-right: 10px;
      }
    }

    .user-icon {
      color: #699cb9;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .switch {
      padding: 5px 16px;
      margin-left: 15px;
      color: #f7f7f4;
      background-color: #c7b45d;
      border: none;
      border-radius: 16px;
      line-height: 1.5;
      font-size: 1.25rem;
      cursor: pointer;
    }
  }
}
</style>

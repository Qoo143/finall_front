<template>
  <header class="navbar">
    <nav class="navbar__left">
      <button @click="onClickMenu">選單</button>
      <button>首頁</button>
      <button>商品</button>
      <button>訂單</button>
      <button>關於</button>
    </nav>

    <div class="navbar__center">
      <img src="/img/QIANTA2.svg" alt="Logo" class="navbar__logo" />
    </div>

    <div class="navbar__right">
      <button>購物車</button>
    </div>
  </header>
</template>

<script setup lang="ts">
function onClickMenu() {
  alert("選單被點了！");
}
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background-color: transparent;
  color: white;

  &__left,
  &__center,
  &__right {
    display: flex;
    align-items: center;
    pointer-events: auto;
  }

  &__center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none; // logo 不阻擋操作（可選）
  }

  &__left,
  &__right {
    gap: 0.75rem;
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
</style>

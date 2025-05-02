<template>
  <div class="wrapper">
    <button @click="isShow = !isShow">test</button>
    <transition name="fade">
      <div v-if="isShow" class="testP"></div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const isShow = ref(false);
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
  background-color: $primary-b-ll;
  display: flex;
  position: relative;
  justify-content: center;
  button {
    margin-top: 50px;
    padding: 10px 10px 10px 10px;
    font-size: 16px;
    height: 32px;
    line-height: 0.8;
  }
  .testP {
    width: 100px;
    height: 100px;
    position: absolute;
    left: 50%;
    top: 50%;

    border: 2px solid red;
  }
}
</style>
<style lang="scss">
//定義vue-animation
.fade-enter-from {
  opacity: 0;
  transform: translate(-10%, -10%);
}
.fade-enter-to {
  opacity: 1;
}
.fade-enter-active {
  transition: all 0.8s ease;
}
.fade-leave-from {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
  transform: translate(-10%, -10%);
}
.fade-leave-active {
  transition: all 0.8s ease;
}
</style>

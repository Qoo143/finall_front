<template>
  <div class="wrapper">
    <Navbar></Navbar>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/views/home/components/Navbar.vue";
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
  background-color: rgb(229, 232, 236);
}
</style>

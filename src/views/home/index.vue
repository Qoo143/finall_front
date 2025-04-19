<template>
  <div><Headpart class="header" /></div>
</template>

<script setup lang="ts">
import Headpart from "@/components/Headpart.vue";
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100vh;
  background-color: $bg-3;

  .header {
    width: 100%;
    height: 60px;
  }
}
</style>

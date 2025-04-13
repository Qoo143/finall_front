<script setup lang="ts"></script>

<template>
  <div class="page">
    <RouterView />
  </div>
</template>

<style scoped>
.submit-float-bar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  pointer-events: auto;
  transform: translateZ(0); 
}
</style>

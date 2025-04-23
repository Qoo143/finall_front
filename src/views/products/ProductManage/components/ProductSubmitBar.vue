<template>
  <div class="inputSection">
    <button class="submitBtn" @click="submitFn?.()">
      {{ isSubmitting ? "處理中..." : createMode ? "上傳商品" : "保留變更" }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  createMode: boolean;
  submitFn?: () => void;
  isSubmitting?: boolean;
}>();
</script>

<style lang="scss" scoped>
.inputSection {
  display: flex;
  justify-content: end;
  .submitBtn {
    padding: 12px 24px;
    color: $bg-1;
    background-color: rgb(57, 161, 230);
    border: none;
    border-radius: 999px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }
}
</style>

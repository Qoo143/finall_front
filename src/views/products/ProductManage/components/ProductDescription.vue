<template>
  <div class="productDescription">
    <label>產品說明</label>
    <textarea
      v-model="modelValue.description"
      class="custom-textarea"
      placeholder="請輸入產品說明"
    />
  </div>
</template>

<script setup lang="ts">
import { defineModel } from "vue";
const model = defineModel();
</script>

<style scoped lang="scss">
.productDescription {
  height: 100%;
  width: 100%;
  .custom-textarea {
    width: 100%;
    border-radius: 8px;
    resize: vertical;
    min-height: 100px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
}
</style>

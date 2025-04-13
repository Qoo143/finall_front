<template>
  <div class="search-bar">
    <input
      v-model="searchKeyword"
      type="text"
      placeholder="搜尋商品名稱、描述或分類"
      @input="emitSearch"
    />
  </div>  
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const emit = defineEmits<{
  (e: "update:keyword", value: string): void;
}>();

const searchKeyword = ref("");

// 發射搜尋字串給父組件
const emitSearch = () => {
  emit("update:keyword", searchKeyword.value);
};
</script>

<style scoped lang="scss">
.search-bar {
  margin-bottom: 16px;

  input {
    width: 100%;
    max-width: 320px;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
  }
}
</style>

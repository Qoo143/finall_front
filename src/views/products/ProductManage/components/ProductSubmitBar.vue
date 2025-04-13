<template>
  <div class="submit-float-bar">
    <button class="submit-btn" @click="$emit('submit')">
      {{ isEditMode ? "保留變更" : "上傳商品" }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isEditMode: boolean;
}>();
defineEmits<{
  (e: "submit"): void;
}>();
</script>

<style scoped>
.submit-float-bar {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 100;
}

.submit-btn {
  padding: 12px 24px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.2s ease;
}

.submit-btn:hover {
  background-color: #317fce;
  transform: translateY(-2px);
}
</style>

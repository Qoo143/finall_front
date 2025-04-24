<template>
  <div class="product-model-upload layout">
    <div class="headEdit">
      <div class="contentEdit">3D模型上傳區</div>
    </div>
    <!-- 上傳 -->
    <div class="upload-side">
      <div class="upload-group">
        <label class="upload-label">GLB模型</label>
        <input
          type="file"
          accept=".glb"
          class="upload-input"
          @change="handleModelUpload"
        />
      </div>
      <div class="actions" v-if="hasModel">
        <button class="save-button" @click="clearModel">清除模型</button>
      </div>
    </div>
    <!-- Canvas 預覽 -->
    <div class="preview-side">
      <div class="preview-wrapper">
        <div v-if="!previewUrl" class="preview-placeholder">尚未上傳模型</div>
        <model-viewer
          :src="previewUrl"
          alt="3D模型預覽"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          reveal="auto"
          style="width: 100%; height: 100%"
        ></model-viewer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import "@google/model-viewer";

// 綁定到父組件的值
const productData = defineModel<{
  model_url: string | null;
  model_file: File | null;
}>();

// 計算是否有模型（無論是URL還是文件）
const hasModel = computed(() => {
  return !!(productData.value?.model_url || productData.value?.model_file);
});

// 計算預覽URL
const previewUrl = computed(() => {
  // 如果有上傳新文件，優先使用新文件預覽
  if (productData.value?.model_file) {
    return URL.createObjectURL(productData.value.model_file);
  }

  // 否則使用已有的URL
  if (productData.value?.model_url) {
    // 如果是相對路徑，添加基礎URL
    if (productData.value.model_url.startsWith("/")) {
      return `http://localhost:3007${productData.value.model_url}`;
    }
    return productData.value.model_url;
  }

  return "";
});

// 處理模型上傳
const handleModelUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0 && productData.value) {
    // 先檢查 productData.value 是否存在
    productData.value.model_file = input.files[0];
    productData.value.model_url = null;
  }
};

const clearModel = () => {
  if (productData.value) {
    productData.value.model_url = null;
    productData.value.model_file = null;
  }
};
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: column;
  width: 100%;

  .headEdit {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;

    .contentEdit {
      font-size: 24px;
      color: $primary-b-d;
      font-weight: 600;
    }
  }
}

.preview-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
  background-color: #f2f2f2;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 18px;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom right, #fafafa, #f2f2f2);
}

.upload-side {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 16px;
  margin-bottom: 16px;
}

.upload-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.save-button {
  height: 40px;
  width: 80px;
  background-color: $primary-b-ll;
  color: $primary-b-d;
  border: 1px solid $primary-b-d;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $primary-b-l;
  }
}
</style>

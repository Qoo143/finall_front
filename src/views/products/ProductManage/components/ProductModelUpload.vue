<template>
  <div class="product-model-upload layout">
    <div class="headEdit">
      <div class="contentEdit">3D模型上傳區</div>
    </div>
    <!-- 上傳 -->
    <div class="upload-side">
      <div class="upload-group">
        <label class="upload-label">GLB模型</label>
        <input type="file" accept=".glb" class="upload-input" />
      </div>
    </div>
    <!-- Canvas 預覽 -->
    <div class="preview-side">
      <div class="preview-wrapper">
        <canvas ref="canvasRef" class="preview-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

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

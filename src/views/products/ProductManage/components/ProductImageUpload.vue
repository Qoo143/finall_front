<template>
  <div class="image-upload-wrapper">
    <!-- 上傳按鈕 -->
    <label class="upload-upload-box">
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        @change="handleUpload"
      />
      <div class="upload-placeholder">＋</div>
    </label>

    <!-- 預覽圖片 -->
    <div v-for="(img, index) in model" :key="index" class="image-container">
      <div class="img-box">
        <img :src="getPreviewUrl(img.file)" class="preview-img" />
        <button class="delete-btn" @click="removeImage(index)">✕</button>
      </div>

      <label class="main-radio">
        <input
          type="radio"
          name="main-image"
          :checked="img.isMain"
          @change="setAsMain(index)"
        />
        主圖
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface UploadImage {
  file: File;
  isMain: boolean;
}

const model = defineModel<UploadImage[]>({ required: true });

function handleUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (files) {
    const newItems = Array.from(files).map((file, idx) => ({
      file,
      isMain: model.value.length === 0 && idx === 0,
    }));
    model.value.push(...newItems);
  }
}

function removeImage(index: number) {
  const wasMain = model.value[index].isMain;
  model.value.splice(index, 1);

  if (wasMain && model.value.length > 0) {
    model.value[0].isMain = true;
  }
}

function setAsMain(index: number) {
  model.value.forEach((img, i) => {
    img.isMain = i === index;
  });
}

function getPreviewUrl(file: File) {
  return URL.createObjectURL(file);
}
</script>

<style scoped lang="scss">
.image-upload-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

.upload-upload-box {
  width: 160px;
  height: 160px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.upload-placeholder {
  font-size: 36px;
  color: #999;
  user-select: none;
}

.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.img-box {
  position: relative;
  width: 160px;
  height: 160px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 14px;
  cursor: pointer;
  z-index: 1;
}

.main-radio {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;

  input[type="radio"] {
    accent-color: #666; // 灰色調
  }
}
</style>

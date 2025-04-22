<template>
  <div class="image-upload-wrapper" ref="scrollWrapper">
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
          :checked="img.is_main"
          @change="setAsMain(index)"
        />
        主圖
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { ImageData } from "@/types/productApiResponse"; //圖片格式

const model: any = defineModel<ImageData[]>({ required: true });

/*
 ** 選擇圖片後觸發 => 將照片資料加到v-model
 */
function handleUpload(e: Event) {
  //拿到使用者選的所有檔案（FileList）
  const files = (e.target as HTMLInputElement).files;
  //如果獲取到的格式是file
  if (files) {
    //將圖片包裝成固定格式
    const newItems = Array.from(files).map((file, idx) => ({
      id: 0, // 新增圖片預設 id = 0
      file, // 是 File 物件，用來顯示預覽圖
      is_main: model.value.length === 0 && idx === 0, // 第一張圖當主圖
    }));
    //全部加進去productData的圖片列表
    model.value.push(...newItems);
  }
}
/*
 ** 刪除圖片
 */
function removeImage(index: number) {
  const img = model.value[index];

  // 記錄被刪除的圖片ID（如果有）
  const deletedId = img.id;

  // 檢查是否是主圖
  const wasMain = img.is_main;

  // 從陣列中刪除
  model.value.splice(index, 1);

  // 如果刪除的是主圖且還有其他圖片，則將第一張設為主圖
  if (wasMain && model.value.length > 0) {
    model.value[0].is_main = true;
  }

  // 這裡不需要 emit 事件
}

//設置主圖
function setAsMain(index: number) {
  model.value.forEach((img: any, i: any) => {
    img.is_main = i === index;
  });
}

//預覽圖片(圖源可能為後端str，也可能為前端用戶上傳)
function getPreviewUrl(file: string | File): string {
  console.log("處理圖片URL:", file);

  // 如果是File對象，使用createObjectURL
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }

  // 如果是字符串URL
  if (typeof file === "string") {
    // 如果是相對路徑，添加基礎URL
    if (file.startsWith("/")) {
      const url = `http://127.0.0.1:3007${file}`; // 使用你的API服務器地址
      console.log("完整URL:", url);
      return url;
    }
    return file;
  }

  // 預設情況
  return "";
}
//----------<<滾動邏輯>>----------
const scrollWrapper = ref<HTMLElement | null>(null);

function handleWheelScroll(e: WheelEvent) {
  if (!scrollWrapper.value) return;
  if (e.deltaY !== 0) {
    e.preventDefault(); // 阻止預設垂直滾動
    scrollWrapper.value.scrollLeft += e.deltaY; // 改為水平捲動
  }
}

onMounted(() => {
  console.log("圖片數據:", model.value);
  if (model.value && model.value.length > 0) {
    console.log("第一張圖片:", model.value[0]);
    console.log("第一張圖片的file屬性:", model.value[0].file);
  }
  if (scrollWrapper.value) {
    scrollWrapper.value.addEventListener("wheel", handleWheelScroll, {
      passive: false,
    });
  }
});

onBeforeUnmount(() => {
  if (scrollWrapper.value) {
    scrollWrapper.value.removeEventListener("wheel", handleWheelScroll);
  }
});
//----------<<滾動邏輯>>----------
</script>

<style scoped lang="scss">
.image-upload-wrapper {
  display: flex;
  flex-wrap: nowrap; // 禁止換行
  overflow-x: auto; // 啟用水平滾動
  gap: 16px; // 圖片間距
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE / Edge

  &::-webkit-scrollbar {
    display: none; // Chrome / Safari / Edge
  }
}

.upload-upload-box {
  flex: 0 0 auto; // 不要自動縮放
  width: 120px;
  height: 120px;
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
  width: 120px;
  height: 120px;
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

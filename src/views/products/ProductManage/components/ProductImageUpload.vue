<template>
  <div class="imageUploadWrapper" ref="scrollWrapper">
    <!-- 上傳按鈕 -->
    <label class="uploadUploadBox">
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        @change="handleUpload"
      />
      <div class="uploadPlaceholder">＋</div>
    </label>

    <!-- 預覽圖片 -->
    <div v-for="(img, index) in images" :key="index" class="imageContainer">
      <div class="imgBox">
        <img :src="getPreviewUrl(img.file)" class="previewImg" />
        <button class="deleteBtn" @click="removeImage(index)">✕</button>
      </div>

      <label class="mainRadio">
        <input
          type="radio"
          name="main-image"
          :checked="img.is_main === 1 ? true : false"
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
import { getImageUrl } from "@/utils/urlHelpers";

// 預覽圖片方法
const getPreviewUrl = (file: string | File): string => {
  // 如果是File對象，使用createObjectURL
  if (file instanceof File) return URL.createObjectURL(file);

  // 如果是字符串URL
  if (typeof file === "string") {
    return getImageUrl(file);
  }

  // 預設情況
  return "";
};


const images = defineModel<ImageData[]>("images", { required: true });
const deletedIds = defineModel<number[]>("deletedIds", { required: true });

/**
 *  選擇圖片後觸發 => 將圖片包裝成固定格式 推入v-model(productData.images)
 */
const handleUpload = (e: Event) => {
  //拿到使用者選的所有檔案（FileList）
  const files = (e.target as HTMLInputElement).files;

  if (files) {
    //Array.from() 把它轉成標準陣列後才能 .map
    const newItems = Array.from(files).map((file, idx) => ({
      id: 0, // 新增圖片預設 id = 0
      file, // 此時為File物件
      is_main: images.value.length === 0 && idx === 0 ? 1 : 0, // 若目前父組件沒傳值，綁定第一張為is_main = 1
    }));

    images.value.push(...newItems);
  }
};
/**
 *  刪除圖片+取消渲染
 *  (點擊刪除觸發，將圖片id移除model，不會被預覽與渲染)
 */

const removeImage = (index: number) => {
  //先獲取被刪除圖片
  const img = images.value[index];

  // 記錄被刪除的圖片ID（如果有）
  if (img.id) {
    deletedIds.value.push(img.id); //目前沒用到
  }
  // 檢查是否是主圖
  const wasMain = img.is_main;

  // 從陣列中刪除
  images.value.splice(index, 1);

  // 如果刪除的是主圖且還有其他圖片，則將第一張設為主圖
  if (wasMain && images.value.length > 0) {
    images.value[0].is_main = 1;
  }
};

/**
 * 單純設置主圖
 */
const setAsMain = (index: number) => {
  images.value.forEach((img: any, i: any) => {
    img.is_main = i === index ? 1 : 0;
  });
};

//----------<<滾動邏輯>>----------
const scrollWrapper = ref<HTMLElement | null>(null);
/**
 * 將滾動事件改為水平滾動
 */
const handleWheelScroll = (e: WheelEvent) => {
  if (!scrollWrapper.value) return; // 安全檢查
  //滾輪垂直方向的滾動量，向下滾動為正值，向上滾動為負值
  if (e.deltaY !== 0) {
    e.preventDefault(); // 阻止預設垂直滾動
    scrollWrapper.value.scrollLeft += e.deltaY; // 改為水平捲動
  }
};
/**
 * 綁定滾動事件
 */
onMounted(() => {
  // 檢查初始數據
  console.log("初始圖片數據:", JSON.stringify(images.value));
  //設置 passive: false 告訴瀏覽器我們需要調用 preventDefault()，這是實現自定義滾動行為的必要設置
  if (scrollWrapper.value) {
    scrollWrapper.value.addEventListener("wheel", handleWheelScroll, {
      passive: false,
    });
  }
});
/**
 * 解除滾動事件
 */
onBeforeUnmount(() => {
  //防止內存洩漏
  if (scrollWrapper.value) {
    scrollWrapper.value.removeEventListener("wheel", handleWheelScroll);
  }
});
//----------<<滾動邏輯>>----------
</script>

<style scoped lang="scss">
.imageUploadWrapper {
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

.uploadUploadBox {
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

.uploadPlaceholder {
  font-size: 36px;
  color: #999;
  user-select: none;
}

.imageContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.imgBox {
  position: relative;
  width: 120px;
  height: 120px;
}

.previewImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.deleteBtn {
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

.mainRadio {
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

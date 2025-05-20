<template>
  <el-dialog v-model="visibleModel" width="70%" top="5vh" destroy-on-close>
    <!-- 加載狀態顯示 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 商品詳情區域 -->
    <div v-else-if="localProduct" class="product-detail">
      <!-- 左側區域：商品圖片/3D模型展示區 -->
      <div class="detail-image">
        <!-- 主視覺區域 -->
        <div class="image-container">
          <!-- 切換按鈕：在圖片和3D模型之間進行切換 -->
          <div class="view-toggle" v-show="hasModel">
            <el-button-group>
              <!-- 圖片模式按鈕 - 當前為圖片模式時按鈕高亮 -->
              <el-button
                :type="viewMode === 'image' ? 'primary' : ''"
                @click="viewMode = 'image'"
                size="small"
              >
                <el-icon><Picture /></el-icon>
              </el-button>
              <!-- 3D模型模式按鈕 - 只有當產品有模型時才可用 -->
              <el-button
                :type="viewMode === 'model' ? 'primary' : ''"
                @click="viewMode = 'model'"
                size="small"
                :disabled="!hasModel"
              >
                <el-icon><Coin /></el-icon>
              </el-button>
            </el-button-group>
          </div>

          <!-- 圖片顯示 -->
          <div v-if="viewMode === 'image'" class="image-view">
            <img
              :src="currentImageUrl"
              :alt="localProduct.name || '商品圖片'"
              class="main-image"
            />
          </div>

          <!-- 3D模型顯示 -->
          <div v-else-if="viewMode === 'model' && modelUrl" class="model-view">
            <model-viewer
              :src="modelUrl"
              alt="3D模型預覽"
              auto-rotate
              camera-controls
              shadow-intensity="1"
              style="width: 100%; height: 100%"
            ></model-viewer>
          </div>
        </div>

        <!-- 縮略圖區域 - 無論在模型還是圖片模式下都可以點擊 -->
        <div v-if="productImages.length > 1" class="image-thumbnails">
          <div
            v-for="(image, index) in productImages"
            :key="index"
            :class="[
              'thumbnail',
              { active: currentImageIndex === index && viewMode === 'image' },
            ]"
            @click="handleThumbnailClick(index)"
          >
            <img
              :src="getThumbnailUrl(image.file)"
              :alt="`縮略圖 ${index + 1}`"
            />
          </div>
        </div>
      </div>

      <div class="detail-info">
        <h2>{{ localProduct.name }}</h2>
        <div class="price">${{ localProduct.price }}</div>

        <!-- 添加商品分類顯示 -->
        <div class="category">
          <span class="label">分類:</span>
          <span class="value">{{ getCategoryName }}</span>
        </div>

        <div class="stock">庫存: {{ localProduct.stock }}</div>
        <div
          class="tags"
          v-if="localProduct.tags && localProduct.tags.length > 0"
        >
          <span v-for="tag in localProduct.tags" :key="tag.id" class="tag">
            {{ tag.name }}
          </span>
        </div>

        <!-- 商品建立時間顯示 -->
        <div class="creation-time" v-if="localProduct.created_time">
          <span>上架時間: {{ formatDate(localProduct.created_time) }}</span>
        </div>

        <!-- 商品描述 -->
        <div class="description">
          <h3>商品描述</h3>
          <p>{{ localProduct.description || "暫無描述" }}</p>
        </div>

        <div class="actions">
          <el-button
            type="primary"
            size="large"
            :loading="isLoadingModel"
            @click="handleAddToCart"
            >加入購物車</el-button
          >
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useUserInfoStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import { Picture, Coin } from "@element-plus/icons-vue";
import "@google/model-viewer";
import axios from "axios";

// 定義介面
interface Tag {
  id: number;
  name: string;
}

interface ProductImage {
  id: number;
  file: string;
  is_main: number;
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  is_active?: number;
  category_id?: number;
  main_image_url?: string;
  tags?: Tag[];
  images?: ProductImage[];
  model_url?: string;
  created_time?: string; // 新增商品建立時間字段
}

const userStore = useUserInfoStore();

// 使用 defineModel 雙向綁定
const visibleModel = defineModel<boolean>("visible", { default: false });
const productModel = defineModel<Product | null>("product", { default: null });
const isLoadingModel = defineModel<boolean>("isLoading", { default: false });

// 本地狀態
const localProduct = ref<Product | null>(null);
const isLoading = ref(false);
const productImages = ref<ProductImage[]>([]);
const currentImageIndex = ref(0);
const viewMode = ref<"image" | "model">("image");
const categories = ref<Category[]>([]);

// 格式化日期函數
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "未知";

  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("日期格式化錯誤:", error);
    return "日期格式錯誤";
  }
};

// 監聽對話框和產品變化
watch([visibleModel, productModel], async ([visible, product]) => {
  if (visible && product && product.id) {
    // 清空舊數據
    localProduct.value = null;
    productImages.value = [];

    // 設置加載狀態
    isLoading.value = true;
    isLoadingModel.value = true;

    try {
      // 並行獲取商品詳情、標籤和分類列表
      const [productRes, categoriesRes, tagsRes] = await Promise.all([
        axios.get(`http://127.0.0.1:3007/products/${product.id}`),
        axios.get("http://127.0.0.1:3007/categories"),
        axios.get(`http://127.0.0.1:3007/api/products/${product.id}/tags`),
      ]);

      if (productRes.data && productRes.data.code === 0) {
        // 獲取基本商品信息
        localProduct.value = productRes.data.data;

        // 處理圖片
        processProductImages();
      }

      // 獲取分類信息
      if (categoriesRes.data && categoriesRes.data.code === 0) {
        categories.value = categoriesRes.data.data || [];
      }

      // 確保標籤數據正確加載
      if (tagsRes.data && tagsRes.data.code === 0 && localProduct.value) {
        // 明確設置標籤數據
        localProduct.value.tags = tagsRes.data.data || [];
      }

      // 重置視圖模式
      viewMode.value = "image";
    } catch (error) {
      console.error("獲取商品詳情失敗:", error);
      ElMessage.error("獲取商品詳情失敗，請稍後再試");
    } finally {
      isLoading.value = false;
      isLoadingModel.value = false;
    }
  }
});

// 處理產品圖片
const processProductImages = () => {
  if (!localProduct.value) return;

  // 1. 從 images 陣列獲取圖片 (如果有)
  if (localProduct.value.images && localProduct.value.images.length > 0) {
    productImages.value = [...localProduct.value.images];

    // 找到主圖的索引
    const mainIdx = productImages.value.findIndex((img) => img.is_main === 1);
    currentImageIndex.value = mainIdx >= 0 ? mainIdx : 0;
  }
  // 2. 如果沒有圖片陣列但有主圖 URL (從產品列表來的情況)
  else if (localProduct.value.main_image_url) {
    productImages.value = [
      {
        id: 0,
        file: localProduct.value.main_image_url,
        is_main: 1,
      },
    ];
    currentImageIndex.value = 0;
  }
  // 3. 無圖片情況
  else {
    productImages.value = [];
    currentImageIndex.value = 0;
  }
};

// 計算屬性: 獲取商品所屬分類名稱
const getCategoryName = computed(() => {
  if (!localProduct.value || !localProduct.value.category_id) return "未分類";

  const category = categories.value.find(
    (c) => c.id === localProduct.value?.category_id
  );

  return category ? category.name : "未分類";
});

// 當前顯示的圖片URL
const currentImageUrl = computed(() => {
  if (productImages.value.length === 0) return "/img/placeholder.png";

  const currentImage = productImages.value[currentImageIndex.value];
  return currentImage ? getImageUrl(currentImage.file) : "/img/placeholder.png";
});

// 判斷是否有模型可顯示
const hasModel = computed(() => {
  return !!localProduct.value?.model_url;
});

// 模型URL
const modelUrl = computed(() => {
  if (!localProduct.value?.model_url) return null;

  const url = localProduct.value.model_url;
  return url.startsWith("/") ? `http://127.0.0.1:3007${url}` : url;
});

// 處理縮略圖點擊
function handleThumbnailClick(index: number) {
  // 更新當前圖片索引
  currentImageIndex.value = index;

  // 如果當前是模型視圖，切換回圖片視圖
  if (viewMode.value === "model") {
    viewMode.value = "image";
  }
}

// 獲取圖片完整URL
function getImageUrl(url: string) {
  if (!url) return "/img/placeholder.png";
  return url.startsWith("/") ? `http://127.0.0.1:3007${url}` : url;
}

// 獲取縮略圖URL (與原圖相同)
function getThumbnailUrl(url: string) {
  return getImageUrl(url);
}

// 加入購物車
const handleAddToCart = () => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入後再加入購物車");
    return;
  }

  if (!localProduct.value) return;

  try {
    // 使用 localProduct 替代 productModel
    emit("addToCart", localProduct.value);
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error("加入購物車失敗");
    }
  }
};

// 定義事件
const emit = defineEmits(["addToCart", "close"]);
</script>

<style scoped lang="scss">
/* 商品詳情彈窗樣式 - 樣式保持不變 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background-color: $primary-b-d;
    color: rgb(54, 116, 100);
    
    .el-dialog__title {
      color: white;
      font-weight: 600;
    }
  }
}

/* 加載狀態容器樣式 */
.loading-container {
  padding: 40px;
  text-align: center;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .detail-image {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .image-container {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 4/3;

      .view-toggle {
        position: absolute;
        top: 24px;
        right: 24px;
        z-index: 10;
      }

      .image-view,
      .model-view {
        width: 100%;
        height: 100%;

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 16px;
          overflow: hidden;
        }
      }
    }

    .image-thumbnails {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;

      .thumbnail {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.2s ease;
        border: 2px solid transparent;

        &:hover {
          opacity: 0.9;
        }

        &.active {
          opacity: 1;
          border-color: $primary-b-d;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .detail-info {
    h2 {
      font-size: 28px;
      font-weight: 700;
      color: $primary-b-d;
      margin-bottom: 16px;
    }

    .price {
      font-size: 32px;
      font-weight: 700;
      color: $primary-y;
      margin-bottom: 16px;
    }

    .category {
      font-size: 18px;
      color: $text-d;
      margin-bottom: 16px;
      display: flex;
      align-items: center;

      .label {
        font-weight: 500;
        margin-right: 8px;
      }
    }

    .stock {
      font-size: 18px;
      color: $text-d;
      margin-bottom: 16px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;

      .tag {
        background-color: $primary-b-ll;
        color: $primary-b-d;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 14px;
      }
    }

    .description {
      background-color: $bg-1;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 16px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: $primary-b-d;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
        line-height: 1.6;
        color: $text-d;
      }
    }

    /* 新增商品建立時間樣式 */
    .creation-time {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      font-size: 14px;
      color: #888; /* 使用較淡的顏色，不搶眼 */

      .el-icon {
        font-size: 16px;
        color: $primary-b-l;
      }
    }

    .actions {
      display: flex;
      gap: 16px;

      .el-button {
        flex: 1;
      }
    }
  }
}
</style>

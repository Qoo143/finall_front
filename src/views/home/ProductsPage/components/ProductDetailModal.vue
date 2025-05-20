<template>
  <el-dialog
    v-model="visibleModel"
    title="商品詳情"
    width="70%"
    top="5vh"
    destroy-on-close
  >
    <div v-if="productModel" class="product-detail">
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
              :alt="productModel.name"
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
        <h2>{{ productModel.name }}</h2>
        <div class="price">${{ productModel.price }}</div>
        
        <!-- 添加商品分類顯示 -->
        <div class="category">
          <span class="label">分類:</span>
          <span class="value">{{ getCategoryName }}</span>
        </div>
        
        <div class="stock">庫存: {{ productModel.stock }}</div>
        <div class="tags">
          <span v-for="tag in productModel.tags" :key="tag.id" class="tag">
            {{ tag.name }}
          </span>
        </div>
        <div class="description">
          <h3>商品描述</h3>
          <p>{{ productModel.description || "暫無描述" }}</p>
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
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active?: number;
  category_id?: number;
  main_image_url: string;
  tags?: Tag[];
  images?: ProductImage[];
  model_url?: string;
}

const userStore = useUserInfoStore();

// 使用 defineModel 雙向綁定，確保類型正確
const visibleModel = defineModel<boolean>("visible", { default: false });
const productModel = defineModel<Product | null>("product", { default: null });
const isLoadingModel = defineModel<boolean>("isLoading", { default: false });

// 商品圖片相關狀態
const productImages = ref<ProductImage[]>([]);
const currentImageIndex = ref(0);
const viewMode = ref<"image" | "model">("image");

// 新增: 分類列表
const categories = ref<Category[]>([]);

// 新增: 獲取分類列表
const fetchCategories = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:3007/categories");
    if (res.data && res.data.code === 0) {
      categories.value = res.data.data || [];
    }
  } catch (error) {
    console.error("獲取分類列表失敗:", error);
  }
};

// 新增: 計算商品所屬分類名稱
const getCategoryName = computed(() => {
  if (!productModel.value || !productModel.value.category_id) return "未分類";
  
  const category = categories.value.find(
    c => c.id === productModel.value?.category_id
  );
  
  return category ? category.name : "未分類";
});

// 在組件掛載時獲取分類列表
onMounted(() => {
  fetchCategories();
});

// 監聽產品變化，更新圖片和索引
watch(
  () => productModel.value,
  (newProduct) => {
    if (newProduct && newProduct.images && newProduct.images.length > 0) {
      productImages.value = newProduct.images;

      // 找到主圖的索引並設為當前顯示圖片
      const mainImageIndex = newProduct.images.findIndex(
        (img) => img.is_main === 1
      );
      currentImageIndex.value = mainImageIndex >= 0 ? mainImageIndex : 0;
    } else if (newProduct) {
      // 如果沒有圖片陣列但有主圖，創建一個只包含主圖的圖片陣列
      productImages.value = [
        {
          id: 0,
          file: newProduct.main_image_url,
          is_main: 1,
        },
      ];
      currentImageIndex.value = 0;
    } else {
      productImages.value = [];
      currentImageIndex.value = 0;
    }

    // 重置視圖模式為圖片
    viewMode.value = "image";
  },
  { immediate: true }
);

// 當前顯示的圖片URL
const currentImageUrl = computed(() => {
  if (productImages.value.length === 0) return "/img/placeholder.png";
  return getImageUrl(productImages.value[currentImageIndex.value].file);
});

// 判斷是否有模型可顯示
const hasModel = computed(() => {
  return !!productModel.value?.model_url;
});

// 模型URL
const modelUrl = computed(() => {
  if (!productModel.value?.model_url) return null;

  if (productModel.value.model_url.startsWith("/")) {
    return `http://127.0.0.1:3007${productModel.value.model_url}`;
  }

  return productModel.value.model_url;
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

  if (url.startsWith("/")) {
    return `http://127.0.0.1:3007${url}`;
  }

  return url;
}

// 獲取縮略圖URL (與原圖相同)
function getThumbnailUrl(url: string) {
  return getImageUrl(url);
}

//直接傳商品資訊讓數量選擇器處理
const handleAddToCart = () => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入後再加入購物車");
    return;
  }

  if (!productModel.value) return;

  try {
    // 直接傳遞原始商品對象，讓 QuantitySelector 自行處理
    emit("addToCart", productModel.value);
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
/* 商品詳情彈窗樣式 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background-color: $primary-b-d;
    color: rgb(54, 116, 100);
    padding: 16px 20px;

    .el-dialog__title {
      color: white;
      font-weight: 600;
    }
  }
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;

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
      // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      aspect-ratio: 4/3;
      // background-color: #f9f9f9;

      .view-toggle {
        position: absolute;
        top: 24px;
        right: 24px;
        z-index: 10;
        // background-color: rgba(255, 255, 255, 0.8);
        // border-radius: 8px;
        // padding: 4px;
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

    /* 新增分類樣式 */
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
      
      // .value {
      //   background-color: $primary-b-ll;
      //   color: $primary-b-d;
      //   padding: 4px 10px;
      //   border-radius: 6px;
      //   font-size: 16px;
      // }
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
      margin-bottom: 24px;

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
<template>
  <el-dialog
    v-model="visibleModel"
    title="商品詳情"
    width="80%"
    top="5vh"
    destroy-on-close
  >
    <div v-if="productModel" class="product-detail">
      <div class="detail-image">
        <img
          :src="productImageUrl"
          :alt="productModel.name"
        />
      </div>
      <div class="detail-info">
        <h2>{{ productModel.name }}</h2>
        <div class="price">${{ productModel.price }}</div>
        <div class="stock">庫存: {{ productModel.stock }}</div>
        <div class="tags">
          <span
            v-for="tag in productModel.tags"
            :key="tag.id"
            class="tag"
          >
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
          >加入購物車</el-button>
          <el-button size="large">收藏商品</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useUserInfoStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

// 定義介面
interface Tag {
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
}

const userStore = useUserInfoStore();

// 使用 defineModel 雙向綁定，確保類型正確
const visibleModel = defineModel<boolean>('visible', { default: false });
const productModel = defineModel<Product | null>('product', { default: null });
const isLoadingModel = defineModel<boolean>('isLoading', { default: false });

// 定義事件
const emit = defineEmits(['addToCart', 'close']);

// 獲取商品圖片 URL
const productImageUrl = computed(() => {
  if (!productModel.value?.main_image_url) return "/img/placeholder.png";
  
  if (productModel.value.main_image_url.startsWith('/')) {
    return `http://127.0.0.1:3007${productModel.value.main_image_url}`;
  }
  
  return productModel.value.main_image_url;
});

// 處理加入購物車
// 處理加入購物車
const handleAddToCart = () => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning('請先登入後再加入購物車');
    return;
  }
  
  if (!productModel.value) return;
  
  try {
    // 發出加入購物車事件，傳遞完整商品信息，包括庫存
    emit('addToCart', productModel.value);
    
    // 注意：不要在這裡立即關閉模態框，應該在確認添加成功後再關閉
    // 所以我們移除了 visibleModel.value = false; 這一行
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('加入購物車失敗');
    }
  }
};
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
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
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
<template>
  <el-dialog
    v-model="visibleValue"
    title="商品詳情"
    width="80%"
    top="5vh"
    destroy-on-close
  >
    <div v-if="product" class="product-detail">
      <div class="detail-image">
        <img
          :src="getProductImageUrl"
          :alt="product.name"
        />
      </div>
      <div class="detail-info">
        <h2>{{ product.name }}</h2>
        <div class="price">${{ product.price }}</div>
        <div class="stock">庫存: {{ product.stock }}</div>
        <div class="tags">
          <span
            v-for="tag in product.tags"
            :key="tag.id"
            class="tag"
          >
            {{ tag.name }}
          </span>
        </div>
        <div class="description">
          <h3>商品描述</h3>
          <p>{{ product.description || "暫無描述" }}</p>
        </div>
        <div class="actions">
          <!-- 添加購物車按鈕，使用 v-loading 顯示載入狀態 -->
          <el-button
            type="primary"
            size="large"
            @click="addToCart"
            :loading="isAddingToCart"
          >加入購物車</el-button>
          <el-button size="large">收藏商品</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCartStore } from '@/stores/cart';
import { useUserInfoStore } from '@/stores/user';
import { ElMessage } from 'element-plus';

const cartStore = useCartStore();
const userStore = useUserInfoStore();

// 追蹤加入購物車的載入狀態
const isAddingToCart = ref(false);

// 定義接口
interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: number;
  category_id: number;
  main_image_url: string;
  tags: Tag[];
}

const props = defineProps<{
  visible: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'add-to-cart', product: Product): void;
}>();

/**
 * 雙向綁定 visible 屬性
 * 使用計算屬性實現 v-model 的雙向綁定
 */
const visibleValue = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

/**
 * 處理商品圖片 URL
 * 自動處理相對路徑和絕對路徑
 */
const getProductImageUrl = computed(() => {
  if (!props.product?.main_image_url) return "/img/placeholder.png";
  
  // 處理相對路徑
  if (props.product.main_image_url.startsWith('/')) {
    return `http://127.0.0.1:3007${props.product.main_image_url}`;
  }
  
  return props.product.main_image_url;
});

/**
 * 處理加入購物車
 * 檢查用戶登入狀態，然後發出事件
 */
const addToCart = async () => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning('請先登入後再加入購物車');
    return;
  }
  
  if (!props.product) return;
  
  // 發出事件到父組件處理
  emit('add-to-cart', props.product);
};
</script>

<style scoped lang="scss">
/* 商品詳情彈窗樣式 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background-color: $primary-b-d;
    color: white;
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
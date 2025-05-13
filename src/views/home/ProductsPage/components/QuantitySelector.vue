<template>
  <el-dialog
    v-model="visibleValue"
    title="選擇數量"
    width="320px"
    center
    :show-close="true"
    custom-class="quantity-dialog"
  >
    <div class="quantity-selector" v-if="product">
      <!-- 商品縮圖 -->
      <img
        :src="getProductImageUrl(product.main_image_url)"
        :alt="product.name"
        class="product-thumbnail"
      />
      
      <!-- 商品信息摘要 -->
      <div class="product-info-mini">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-price">${{ product.price }}</div>
      </div>
      
      <!-- 數量控制器 -->
      <div class="quantity-control">
        <span class="label">數量:</span>
        <el-input-number
          v-model="quantityValue"
          :min="1"
          :max="product.stock || 99"
          size="small"
        />
      </div>
      
      <!-- 操作按鈕 -->
      <div class="quantity-actions">
        <el-button @click="visibleValue = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmQuantity"
          :loading="isAdding"
        >確認</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';

// 初始化 Store
const cartStore = useCartStore();

// 追蹤加入購物車的狀態
const isAdding = ref(false);

// 商品介面
interface Product {
  id: number;
  name: string;
  price: number;
  stock?: number;
  main_image_url: string;
}

const props = defineProps<{
  visible: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'confirm', quantity: number, product: Product): void;
}>();

/**
 * 雙向綁定 visible 屬性
 * 使用計算屬性實現 v-model 的雙向綁定
 */
const visibleValue = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 數量
const quantityValue = ref(1);

/**
 * 獲取商品圖片 URL
 * 處理相對路徑和絕對路徑
 * @param url 圖片URL
 * @returns 完整的圖片URL
 */
const getProductImageUrl = (url: string) => {
  if (!url) return '/img/placeholder.png';
  
  // 處理相對路徑
  if (url.startsWith('/')) {
    return `http://127.0.0.1:3007${url}`;
  }
  
  return url;
};

/**
 * 確認數量並發出事件
 * 使用 emit 傳遞數量和商品資訊給父組件
 */
const confirmQuantity = async () => {
  if (!props.product) return;
  
  try {
    isAdding.value = true;
    
    // 發出事件，將數量和商品資訊傳給父組件
    emit('confirm', quantityValue.value, props.product);
    
    // 重置數量
    quantityValue.value = 1;
  } catch (error) {
    console.error('處理數量選擇時出錯:', error);
  } finally {
    isAdding.value = false;
  }
};
</script>

<style scoped lang="scss">
.quantity-selector {
  display: flex;
  flex-direction: column;
  align-items: center;

  .product-thumbnail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .product-info-mini {
    margin-bottom: 20px;
    text-align: center;

    .product-name {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .product-price {
      color: $primary-y;
      font-weight: 700;
      font-size: 18px;
    }
  }

  .quantity-control {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    .label {
      margin-right: 16px;
      font-size: 16px;
    }
  }

  .quantity-actions {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 12px;

    .el-button {
      flex: 1;
    }
  }
}

/* 對話框樣式自定義 */
:deep(.quantity-dialog) {
  .el-dialog__header {
    padding: 16px;
    margin-right: 0;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }

  .el-dialog__body {
    padding: 20px;
  }
}
</style>
<template>
  <el-dialog
    v-model="visibleModel"
    title="選擇數量"
    width="320px"
    center
    :show-close="true"
    custom-class="quantity-dialog"
  >
    <div class="quantity-selector" v-if="productModel">
      <img
        :src="productImageUrl"
        :alt="productModel.name"
        class="product-thumbnail"
      />
      <div class="product-info-mini">
        <div class="product-name">{{ productModel.name }}</div>
        <div class="product-price">${{ productModel.price }}</div>
      </div>
      <div class="quantity-control">
        <span class="label">數量:</span>
        <el-input-number
          v-model="quantityValue"
          :min="1"
          :max="productModel.stock || 99"
          size="small"
        />
      </div>
      <div class="quantity-actions">
        <el-button @click="cancelSelection">取消</el-button>
        <el-button type="primary" :loading="isLoadingModel" @click="confirmSelection">確認</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

// 定義商品介面
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

// 使用 defineModel 進行雙向綁定，確保類型正確
const visibleModel = defineModel<boolean>('visible', { default: false });
const productModel = defineModel<Product | null>('product', { default: null });
const isLoadingModel = defineModel<boolean>('isLoading', { default: false });
const quantityModel = defineModel<number>('quantity', { default: 1 });

// 本地狀態，不直接修改 model，等確認後再修改
const quantityValue = ref(1);

// 定義事件
const emit = defineEmits(['confirm', 'cancel']);

// 獲取商品圖片 URL
const productImageUrl = computed(() => {
  if (!productModel.value?.main_image_url) return "/img/placeholder.png";
  
  if (productModel.value.main_image_url.startsWith('/')) {
    return `http://127.0.0.1:3007${productModel.value.main_image_url}`;
  }
  
  return productModel.value.main_image_url;
});

// 監聽 dialog 顯示狀態，重置數量
const resetQuantity = () => {
  quantityValue.value = 1;
};

// 監聽 visibleModel 變化
watch(visibleModel, (newValue) => {
  if (newValue) {
    resetQuantity();
  }
});

// 取消選擇
const cancelSelection = () => {
  visibleModel.value = false;
  emit('cancel');
};

// 確認選擇
const confirmSelection = () => {
  // 更新父組件的數量
  quantityModel.value = quantityValue.value;
  
  // 發出確認事件
  emit('confirm', quantityValue.value);
  
  // 關閉對話框
  visibleModel.value = false;
};
</script>

<style scoped lang="scss">
/* 數量選擇彈窗樣式 */
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
</style>
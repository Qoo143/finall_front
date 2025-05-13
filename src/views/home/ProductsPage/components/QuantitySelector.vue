// src/components/QuantitySelector.vue
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
      <img
        :src="getProductImageUrl(product.main_image_url)"
        :alt="product.name"
        class="product-thumbnail"
      />
      <div class="product-info-mini">
        <div class="product-name">{{ product.name }}</div>
        <div class="product-price">${{ product.price }}</div>
      </div>
      <div class="quantity-control">
        <span class="label">數量:</span>
        <el-input-number
          v-model="quantityValue"
          :min="1"
          :max="product.stock || 99"
          size="small"
        />
      </div>
      <div class="quantity-actions">
        <el-button @click="visibleValue = false">取消</el-button>
        <el-button type="primary" @click="confirmQuantity">確認</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

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

// 綁定visible
const visibleValue = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 數量
const quantityValue = ref(1);

// 獲取商品圖片 URL
const getProductImageUrl = (url: string) => {
  if (!url) return '/img/placeholder.png';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:3007${url}`;
};

// 確認數量
const confirmQuantity = () => {
  if (props.product) {
    emit('confirm', quantityValue.value, props.product);
    visibleValue.value = false;
    // 重置數量
    quantityValue.value = 1;
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
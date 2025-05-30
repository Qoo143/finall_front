<template>
  <el-dialog
    v-model="visibleModel"
    title="選擇數量"
    width="640px"
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
        <div class="product-total">
          總計: ${{ totalAmount.toLocaleString() }}
        </div>
      </div>
      <div class="quantity-control">
        <span class="label">數量:</span>
        <el-input-number
          v-model="quantityValue"
          :min="1"
          :max="maxAvailableQuantity"
          size="small"
        />
      </div>
      <div class="quantity-actions">
        <el-button @click="cancelSelection">取消</el-button>
        <el-button
          type="primary"
          :loading="isLoadingModel"
          @click="confirmSelection"
          >確認</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useCartStore } from "@/stores/cart";
// 引入 cartStore 來檢查商品在購物車中的數量
const cartStore = useCartStore();

// 定義商品介面
interface Tag {
  id: number;
  name: string;
}

// 修改 Product 介面定義 要支援兩個模組傳進的資料
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active?: number;
  category_id?: number;
  main_image_url?: string; // 從產品列表來的圖片
  images?: {
    // 從詳情視圖來的圖片
    id: number;
    file: string;
    is_main: number;
  }[];
  tags?: Tag[];
}

// 使用 defineModel 進行雙向綁定，確保類型正確
const visibleModel = defineModel<boolean>("visible", { default: false });
const productModel = defineModel<Product | null>("product", { default: null });
const isLoadingModel = defineModel<boolean>("isLoading", { default: false });
const quantityModel = defineModel<number>("quantity", { default: 1 });

// 本地狀態，不直接修改 model，等確認後再修改
const quantityValue = ref(1);

// 定義事件
const emit = defineEmits(["confirm", "cancel"]);

//productImageUrl 計算屬性
const productImageUrl = computed(() => {
  if (!productModel.value) return "/img/placeholder.png";

  // 從 main_image_url 獲取圖片 (產品列表)
  if (productModel.value.main_image_url) {
    const url = productModel.value.main_image_url;
    return url.startsWith("/") ? `http://127.0.0.1:3007${url}` : url;
  }

  // 從 images 數組獲取圖片 (詳情彈窗)
  if (productModel.value.images && productModel.value.images.length > 0) {
    // 查找主圖
    const mainImage = productModel.value.images.find(
      (img) => img.is_main === 1
    );
    const url = mainImage ? mainImage.file : productModel.value.images[0].file;
    return url.startsWith("/") ? `http://127.0.0.1:3007${url}` : url;
  }

  return "/img/placeholder.png";
});

// 總金額計算
const totalAmount = computed(() => {
  if (!productModel.value) return 0;
  return productModel.value.price * quantityValue.value;
});

// 計算目前購物車中已有的商品數量
const existingQuantity = computed(() => {
  if (!productModel.value) return 0;
  const existingItem = cartStore.items.find(
    (item) => item.productId === productModel.value?.id
  );
  return existingItem ? existingItem.quantity : 0;
});

// 計算最大可用數量（庫存減去已在購物車中的數量）
const maxAvailableQuantity = computed(() => {
  if (!productModel.value) return 99;
  return Math.max(1, productModel.value.stock - existingQuantity.value);
});

// 監聽 dialog 顯示狀態，重置數量
const resetQuantity = () => {
  // 設置為最小值 1 與最大可用數量中的較小值
  quantityValue.value = Math.min(1, maxAvailableQuantity.value);
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
  emit("cancel");
};

// 確認選擇
const confirmSelection = () => {
  // 檢查是否超過最大可用數量
  if (quantityValue.value > maxAvailableQuantity.value) {
    quantityValue.value = maxAvailableQuantity.value;
  }

  // 更新父組件的數量
  quantityModel.value = quantityValue.value;

  // 發出確認事件
  emit("confirm", quantityValue.value);

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
    color: red;
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
    width: 350px;
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
    .product-total {
      margin-top: 8px;
      font-weight: 600;
      font-size: 16px;
      color: $primary-b-d;
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

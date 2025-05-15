<template>
  <div class="product-card">
    <div class="product-image">
      <img
        :src="imageUrl"
        :alt="product.name"
        @error="handleImageError"
      />
      <!-- 標籤重疊在圖片上 -->
      <div class="product-tags">
        <span v-for="tag in displayTags" :key="tag.id" class="tag">
          {{ tag.name }}
        </span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">${{ product.price }}</div>
    </div>
    <div class="product-actions">
      <button 
        class="cart-btn" 
        @click="handleAddToCart"
        :disabled="isLoading"
      >
        加入購物車
      </button>
      <button class="view-btn" @click="handleViewDetails">查看詳情</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

// 使用 defineModel 進行雙向綁定，確保類型正確
const product = defineModel<Product>('product', { required: true });
const isLoading = defineModel<boolean>('isLoading', { default: false });
const selectedProduct = defineModel<Product | null>('selectedProduct', { default: null });

// 定義事件，用於通知父組件
const emit = defineEmits(['addToCart', 'viewDetails']);

/**
 * 處理加入購物車 - 檢查用戶登入狀態，然後發出事件
 */
const handleAddToCart = () => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning('請先登入後再加入購物車');
    return;
  }
  
  // 發出事件到父組件處理
  emit('addToCart', product.value);
};

/**
 * 處理查看詳情
 */
const handleViewDetails = () => {
  // 更新選中的商品
  selectedProduct.value = product.value;
  // 通知父組件
  emit('viewDetails', product.value);
};

const imageError = ref(false);

/**
 * 商品圖片 URL 處理 - 自動處理本地和遠程URL
 */
const imageUrl = computed(() => {
  if (imageError.value) return '/img/placeholder.png';
  if (!product.value.main_image_url) return '/img/placeholder.png';
  
  // 處理相對路徑
  if (product.value.main_image_url.startsWith('/')) {
    return `http://127.0.0.1:3007${product.value.main_image_url}`;
  }
  
  return product.value.main_image_url;
});

// 最多顯示 3 個標籤
const displayTags = computed(() => {
  return (product.value.tags || []).slice(0, 3);
});

// 圖片載入錯誤處理
const handleImageError = () => {
  imageError.value = true;
};
</script>

<style scoped lang="scss">
.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    &:hover img {
      transform: scale(1.05);
    }
    
    // 標籤重疊在圖片上
    .product-tags {
      position: absolute;
      bottom: 8px;
      left: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      max-width: calc(100% - 16px);
      
      .tag {
        background-color: rgba(255, 255, 255, 0.85);
        color: $primary-b-d;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
    }
  }
  
  .product-info {
    padding: 16px;
    flex-grow: 1;
    
    .product-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: $primary-b-d;
      // 限制為兩行，超出顯示省略號
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;//顯示一行超過就"..."
      line-clamp: 1;//顯示一行超過就"..."
      -webkit-box-orient: vertical;
      line-height: 1.3;
    }
    
    .product-price {
      font-size: 18px;
      font-weight: 700;
      color: $primary-y;
    }
  }
  
  .product-actions {
    padding: 0 16px 16px;
    display: flex;
    gap: 8px;
    
    .view-btn, .cart-btn {
      flex: 1;
      padding: 8px 0;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
    
    .view-btn {
      background-color: $primary-b-ll;
      color: $primary-b-d;
      
      &:hover:not(:disabled) {
        background-color: $primary-b-l;
      }
    }
    
    .cart-btn {
      background-color: $primary-b-d;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: $primary-b;
      }
    }
  }
}
</style>
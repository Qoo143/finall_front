<!-- src/views/home/ProductsPage/components/ProductCard.vue -->
<template>
  <div class="product-card">
    <div class="product-image">
      <img
        :src="imageUrl || '/img/placeholder.png'"
        :alt="product.name"
        @error="handleImageError"
      />
      <!-- 標籤重疊在圖片上 -->
      <div class="product-tags">
        <span v-for="tag in product.tags.slice(0, 3)" :key="tag.id" class="tag">
          {{ tag.name }}
        </span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">${{ product.price }}</div>
    </div>
    <div class="product-actions">
      <button class="cart-btn" @click="$emit('addToCart', product)">
        <i class="el-icon-shopping-cart"></i>
        加入購物車
      </button>
      <button class="view-btn" @click="$emit('view', product)">查看詳情</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  product: any;
}>();

const imageError = ref(false);

const imageUrl = computed(() => {
  if (imageError.value) return '/img/placeholder.png';
  if (!props.product.main_image_url) return null;
  return `http://127.0.0.1:3007${props.product.main_image_url}`;
});

const handleImageError = () => {
  imageError.value = true;
};

defineEmits(['view', 'addToCart']);
</script>

<style scoped lang="scss">
.product-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: 400px; // 限制最大高度
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    position: relative;
    height: 180px; // 降低圖片高度
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
      top: 8px;
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
        backdrop-filter: blur(2px);
      }
    }
  }
  
  .product-info {
    padding: 12px 16px;
    flex-grow: 0; // 不要自動伸展
    
    .product-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      color: $primary-b-d;
      // 限制為兩行，超出顯示省略號
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.3;
      height: 2.6em; // 固定高度為兩行
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
    }
    
    .view-btn {
      background-color: $primary-b-ll;
      color: $primary-b-d;
      
      &:hover {
        background-color: $primary-b-l;
      }
    }
    
    .cart-btn {
      background-color: $primary-b-d;
      color: white;
      
      &:hover {
        background-color: $primary-b;
      }
      
      i {
        margin-right: 4px;
      }
    }
  }
}
</style>
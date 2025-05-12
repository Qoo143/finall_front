<!-- src/views/home/ProductsPage/components/ProductCard.vue -->
<template>
  <div class="product-card">
    <div class="product-image">
      <img 
        :src="imageUrl || '/img/placeholder.png'" 
        :alt="product.name" 
        @error="handleImageError"
      />
      <div class="product-badges">
        <span v-if="product.is_active" class="badge active">上架中</span>
        <span v-else class="badge inactive">未上架</span>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">${{ product.price }}</div>
      <div class="product-tags">
        <span v-for="tag in product.tags" :key="tag.id" class="tag">
          {{ tag.name }}
        </span>
      </div>
    </div>
    <div class="product-actions">
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

defineEmits(['view']);
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
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
  
  .product-image {
    position: relative;
    height: 220px;
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
    
    .product-badges {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        
        &.active {
          background-color: $primary-b;
          color: white;
        }
        
        &.inactive {
          background-color: #e0e0e0;
          color: #666;
        }
      }
    }
  }
  
  .product-info {
    padding: 16px;
    flex-grow: 1;
    
    .product-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: $primary-b-d;
    }
    
    .product-price {
      font-size: 20px;
      font-weight: 700;
      color: $primary-y;
      margin-bottom: 12px;
    }
    
    .product-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      
      .tag {
        background-color: $primary-b-ll;
        color: $primary-b-d;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }
  
  .product-actions {
    padding: 0 16px 16px;
    
    .view-btn {
      width: 100%;
      padding: 8px 0;
      background-color: $primary-b-d;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: $primary-b;
      }
    }
  }
}
</style>
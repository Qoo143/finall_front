// src/views/checkout/index.vue
<template>
  <div class="checkout-page">
    <h1>結帳頁面</h1>
    <p>這是一個臨時的結帳頁面，等待後端API完成後將會完善功能。</p>
    
    <div class="cart-summary">
      <h2>購物車內容</h2>
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-image">
            <img :src="getProductImageUrl(item.image_url)" :alt="item.name">
          </div>
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <div class="item-info">
              <span>單價: ${{ item.price }}</span>
              <span>數量: {{ item.quantity }}</span>
              <span>小計: ${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="order-total">
        <h3>訂單總額: ${{ cartStore.totalAmount.toFixed(2) }}</h3>
      </div>
      
      <div class="checkout-actions">
        <el-button type="primary" @click="submitOrder">提交訂單</el-button>
        <el-button @click="$router.push('/ProductsPage')">繼續購物</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

// 獲取商品圖片URL
const getProductImageUrl = (url: string) => {
  if (!url) return '/img/placeholder.png';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:3007${url}`;
};

// 提交訂單
const submitOrder = () => {
  ElMessage.success('訂單已提交！（這是模擬操作，等待後端API完成）');
  // 清空購物車
  cartStore.clearCart();
  // 跳轉到訂單頁面
  router.push('/home');
};
</script>

<style scoped lang="scss">
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  
  
  h1 {
    font-size: 32px;
    color: $primary-b-d;
    margin-bottom: 20px;
  }
  
  p {
    color: $text-d;
    margin-bottom: 30px;
  }
  
  .cart-summary {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    h2 {
      font-size: 24px;
      color: $primary-b-d;
      margin-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 12px;
    }
    
    .cart-items {
      margin-bottom: 24px;
    }
    
    .cart-item {
      display: flex;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f5f5f5;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-image {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        overflow: hidden;
        margin-right: 16px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .item-details {
        flex: 1;
        
        h3 {
          font-size: 18px;
          margin: 0 0 8px;
          color: $text-d;
        }
        
        .item-info {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          color: $text-d;
          
          span {
            &:last-child {
              font-weight: 600;
              color: $primary-y;
            }
          }
        }
      }
    }
    
    .order-total {
      background-color: #f9f9f9;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 8px;
      text-align: right;
      
      h3 {
        margin: 0;
        font-size: 24px;
        color: $primary-b-d;
      }
    }
    
    .checkout-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
  }
}
</style>
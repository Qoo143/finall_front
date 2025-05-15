<template>
  <div class="cart-sidebar-backdrop" 
       :class="{ 'active': visible }" 
       @click="closeCart">
  </div>
  
  <div class="cart-sidebar" :class="{ 'active': visible }">
    <div class="cart-header">
      <h2>購物車</h2>
      <button class="close-btn" @click="closeCart">
        <el-icon><Close /></el-icon>
      </button>
    </div>
    
    <div v-if="!cartStore.loading" class="cart-wrapper">
      <div v-if="cartStore.items.length > 0" class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="item-image">
              <img :src="getProductImageUrl(item.image_url)" :alt="item.name">
            </div>
            <div class="item-details">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-price">${{ item.price }}</div>
              <div class="item-quantity">
                <el-input-number 
                  v-model="item.quantity" 
                  :min="1" 
                  :max="99" 
                  size="small"
                  @change="(val:any) => updateQuantity(item.id, val)"
                />
              </div>
            </div>
            <button class="remove-btn" @click="removeItem(item.id)">
              <el-icon><Delete /></el-icon>
            </button>
          </div>
        </div>
        
        <div class="cart-summary">
          <div class="summary-row">
            <span>小計:</span>
            <span>${{ cartStore.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>運費:</span>
            <span>免費</span>
          </div>
          <div class="summary-row total">
            <span>總計:</span>
            <span>${{ cartStore.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="cart-actions">
          <el-button type="primary" class="checkout-btn" @click="checkout">
            結帳
          </el-button>
          <el-button class="clear-btn" @click="cartStore.clearCart()" :loading="cartStore.loading">
            清空購物車
          </el-button>
        </div>
      </div>
      
      <div v-else class="empty-cart">
        <el-empty description="購物車內沒有商品">
          <template #image>
            <el-icon class="empty-icon"><ShoppingCart /></el-icon>
          </template>
          <el-button @click="closeCart">繼續購物</el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- 載入中狀態 -->
    <div v-else class="loading-cart">
      <el-skeleton animated :rows="3" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { useUserInfoStore } from '@/stores/user';
import { Delete, Close, ShoppingCart } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

// 初始化 Store 和路由
const cartStore = useCartStore();
const userStore = useUserInfoStore();
const router = useRouter();

// 接收父組件的props
const props = defineProps<{
  visible: boolean;
}>();

// 定義事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'checkout'): void;
}>();

// 關閉購物車側邊欄
const closeCart = () => {
  emit('update:visible', false);
};

// 更新商品數量
const updateQuantity = (itemId: number, quantity: number) => {
  // 確保用戶已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning('請先登入');
    router.push('/login');
    closeCart();
    return;
  }
  
  cartStore.updateQuantity(itemId, quantity);
};

// 移除商品
const removeItem = (itemId: number) => {
  // 確保用戶已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning('請先登入');
    router.push('/login');
    closeCart();
    return;
  }
  
  cartStore.removeFromCart(itemId);
};

// 獲取商品圖片URL
const getProductImageUrl = (url: string) => {
  if (!url) return '/img/placeholder.png';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:3007${url}`;
};

// 結帳功能
const checkout = () => {
  // 確保用戶已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning('請先登入才能結帳');
    router.push('/login');
    closeCart();
    return;
  }
  
  // 確保購物車不為空
  if (cartStore.items.length === 0) {
    ElMessage.warning('購物車為空，請先添加商品');
    return;
  }
  
  ElMessage.success('前往結帳頁面');
  emit('checkout');
  closeCart();
};
</script>

<style scoped lang="scss">
.cart-sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  
  &.active {
    opacity: 1;
    visibility: visible;
  }
}

.cart-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 380px;
  height: 100%;
  background-color: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &.active {
    right: 0;
  }
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0; /* 防止頭部縮小 */
    
    h2 {
      margin: 0;
      font-size: 24px;
      color: $primary-b-d;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      
      &:hover {
        color: $primary-b-d;
      }
    }
  }
  
  /* 新增一個包裝層 */
  .cart-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 重要：這限制了整體高度 */
    height: calc(100% - 60px); /* 扣除頭部高度 */
  }
  
  .cart-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .cart-items {
    flex: 1;
    overflow-y: auto; /* 只讓商品列表滾動 */
    padding: 20px;
    
    .cart-item {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #f5f5f5;
      padding-bottom: 20px;
      position: relative;
      
      .item-image {
        width: 80px;
        height: 80px;
        overflow: hidden;
        border-radius: 8px;
        margin-right: 15px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .item-details {
        flex: 1;
        
        .item-name {
          font-size: 16px;
          margin: 0 0 5px;
          color: $text-d;
        }
        
        .item-price {
          font-size: 18px;
          font-weight: 600;
          color: $primary-y;
          margin-bottom: 10px;
        }
        
        .item-quantity {
          display: flex;
          align-items: center;
        }
      }
      
      .remove-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: none;
        border: none;
        color: #ccc;
        padding: 5px;
        cursor: pointer;
        
        &:hover {
          color: #f56c6c;
        }
      }
    }
  }
  
  .cart-summary {
    padding: 20px;
    background-color: #f9f9f9;
    color: $primary-b;
    flex-shrink: 0; /* 防止縮小 */
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 16px;
      
      &.total {
        margin-top: 15px;
        font-size: 20px;
        font-weight: 600;
        color: $primary-b-d;
      }
    }
  }
  
  .cart-actions {
    padding: 20px;
    display: flex;
    gap: 10px;
    flex-shrink: 0; /* 防止縮小 */
    
    .checkout-btn {
      flex: 2;
      height: 45px;
      background-color: $primary-b-d;
      
      &:hover {
        background-color: $primary-b;
      }
    }
    .clear-btn{
      height: 45px;
    }
    
    .el-button {
      flex: 1;
    }
  }
  
  .empty-cart, .loading-cart {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    
    .empty-icon {
      font-size: 60px;
      color: #ccc;
    }
  }
}

@media (max-width: 768px) {
  .cart-sidebar {
    width: 100%;
    right: -100%;
  }
}
</style>
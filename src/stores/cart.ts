// src/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserInfoStore } from './user';
import { ElMessage } from 'element-plus';
import { 
  getCart as getCartAPI, 
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI
} from '@/api/cart';

// 定義購物車項目的介面
export interface CartItem {
  id: number;          // 購物車項目ID
  productId: number;   // 商品ID
  name: string;        // 商品名稱
  price: number;       // 商品價格
  quantity: number;    // 購買數量
  image_url: string;   // 商品圖片
}

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserInfoStore();

  // 購物車商品列表
  const items = ref<CartItem[]>([]);
  const loading = ref(false);

  // 計算購物車中的商品總數
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  // 計算購物車總金額
  const totalAmount = computed(() => {
    return items.value.reduce((total, item) => total + item.price * item.quantity, 0);
  });

  /**
   * 獲取購物車內容
   */
  async function fetchCart() {
    if (!userStore.isLoggedIn) {
      return;
    }
  
    loading.value = true;
    try {
      console.log('獲取購物車 - 開始請求');
      
      // 直接使用現有 API，但處理不同的響應格式
      const response:any = await getCartAPI(userStore.token);
      console.log('獲取購物車 - 響應:', response);
      
      // 調整邏輯：response 已經是 data 本身了
      if (response && response.code === 0) {
        const cartData = response.data;
        console.log('獲取購物車 - 解析的數據:', cartData);
        
        if (cartData && cartData.items && Array.isArray(cartData.items)) {
          items.value = cartData.items;
          console.log('購物車商品數量:', items.value.length);
        } else {
          console.warn('獲取購物車 - 響應中沒有 items 陣列');
          items.value = [];
        }
      } else {
        console.warn('獲取購物車 - 響應無效');
        items.value = [];
      }
    } catch (error) {
      console.error('獲取購物車錯誤:', error);
      items.value = [];
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加入購物車
   */
  async function addToCart(
    item: {
      id: number,
      name: string,
      price: number,
      image_url: string
    }, 
    quantity: number
  ) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('請先登入後再加入購物車');
      return;
    }

    if (quantity <= 0) {
      ElMessage.warning('商品數量必須大於 0');
      return;
    }

    loading.value = true;
    try {
      console.log('添加購物車 - 開始請求');
      console.log('添加購物車 - 參數:', { 
        productId: item.id, 
        quantity,
        token: userStore.token.substring(0, 20) + '...' 
      });
      
      const response:any = await addToCartAPI(userStore.token, item.id, quantity);
      console.log('添加購物車 - 響應:', response);
      
      if (response && response.code === 0) {
        ElMessage.success(`已成功加入購物車: ${item.name} x ${quantity}`);
        
        // 重新載入購物車資料
        await fetchCart();
      } else {
        ElMessage.error(response.data?.message || '加入購物車失敗');
      }
    } catch (error:any) {
      console.error('添加購物車錯誤:', error);
      
      // 顯示詳細錯誤信息
      if (error.response) {
        console.error('錯誤響應:', error.response.data);
        ElMessage.error(error.response.data?.message || '加入購物車失敗');
      } else {
        ElMessage.error('加入購物車失敗，請稍後再試');
      }
      
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新購物車商品數量
   */
  async function updateQuantity(itemId: number, quantity: number) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('請先登入後再操作購物車');
      return;
    }

    // 數量為 0 或負數時，刪除該項目
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    loading.value = true;
    try {
      console.log('更新購物車 - 開始請求');
      console.log('更新購物車 - 參數:', { itemId, quantity });
      
      const response:any = await updateCartItemAPI(userStore.token, itemId, quantity);
      console.log('更新購物車 - 響應:', response);
      
      if (response && response.code === 0) {
        // 更新本地狀態
        const index = items.value.findIndex(item => item.id === itemId);
        if (index !== -1) {
          items.value[index].quantity = quantity;
          ElMessage.success('商品數量已更新');
        }
      } else {
        ElMessage.error(response.data?.message || '更新數量失敗');
      }
    } catch (error) {
      console.error('更新購物車錯誤:', error);
      ElMessage.error('更新數量失敗，請稍後再試');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 從購物車移除商品
   */
  async function removeFromCart(itemId: number) {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('請先登入後再操作購物車');
      return;
    }

    loading.value = true;
    try {
      console.log('移除購物車商品 - 開始請求');
      console.log('移除購物車商品 - 參數:', { itemId });
      
      const response:any = await removeFromCartAPI(userStore.token, itemId);
      console.log('移除購物車商品 - 響應:', response);
      
      if (response && response.code === 0) {
        // 從本地狀態中移除
        const removedItem = items.value.find(item => item.id === itemId);
        items.value = items.value.filter(item => item.id !== itemId);
        
        if (removedItem) {
          ElMessage.success(`已從購物車移除: ${removedItem.name}`);
        } else {
          ElMessage.success('商品已從購物車移除');
        }
      } else {
        ElMessage.error(response.data?.message || '移除商品失敗');
      }
    } catch (error) {
      console.error('移除購物車商品錯誤:', error);
      ElMessage.error('移除商品失敗，請稍後再試');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 清空購物車
   */
  async function clearCart() {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('請先登入後再操作購物車');
      return;
    }

    loading.value = true;
    try {
      console.log('清空購物車 - 開始請求');
      
      const response:any = await clearCartAPI(userStore.token);
      console.log('清空購物車 - 響應:', response);
      
      if (response && response.code === 0) {
        // 清空本地狀態
        items.value = [];
        ElMessage.success('購物車已清空');
      } else {
        ElMessage.error(response.data?.message || '清空購物車失敗');
      }
    } catch (error) {
      console.error('清空購物車錯誤:', error);
      ElMessage.error('清空購物車失敗，請稍後再試');
    } finally {
      loading.value = false;
    }
  }

  /**
   * 初始化購物車
   */
  async function initCart() {
    if (userStore.isLoggedIn) {
      try {
        await fetchCart();
      } catch (error) {
        console.error('初始化購物車失敗:', error);
      }
    } else {
      // 未登入時清空購物車
      items.value = [];
    }
  }

  return {
    items,
    totalItems,
    totalAmount,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    initCart
  };
}, {
  persist: true
});
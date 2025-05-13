// src/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserInfoStore } from './user';
import axios from 'axios';
import { ElMessage } from 'element-plus';

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
  const loading = ref(false);//可供前端使用來顯示 loading spinner 或按鈕鎖定

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

    //若已登入（由 userStore.isLoggedIn 判斷），會呼叫後端 /api/cart 取得購物車
    //失敗則改從 localStorage 撈資料備援"loadCartFromLocalStorage()"
    if (!userStore.isLoggedIn) return;

    loading.value = true;
    try {
      const res = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${userStore.token}` }//登入驗證
      });

      if (res.data.code === 0) {
        items.value = res.data.data.items || [];
      }
    } catch (error) {
      console.error('獲取購物車失敗:', error);

      // 如果獲取失敗，嘗試從本地存儲加載 **非常重要**
      loadCartFromLocalStorage();
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
    }, quantity: number) {

    // 檢查用戶是否已登入
    if (!userStore.isLoggedIn) {
      throw new Error('請先登入再加入購物車');
    }

    loading.value = true;
    try {
      //推入商品id與數量
      const res = await axios.post('/api/cart/items', {
        productId: item.id,
        quantity
      }, {
        headers: { Authorization: `Bearer ${userStore.token}` }//登入驗證
      });

      if (res.data.code === 0) {
        // 成功添加後刷新購物車
        await fetchCart();
      }
    } catch (error) {
      console.error('添加到購物車失敗:', error);

      // 後端失敗時，臨時使用前端邏輯
      const existingItemIndex = items.value.findIndex(i => i.productId === item.id);

      if (existingItemIndex !== -1) {
        // 如果已存在，增加數量
        items.value[existingItemIndex].quantity += quantity;
      } else {
        // 如果不存在，添加新商品
        items.value.push({
          id: Date.now(), // 臨時ID
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity,
          image_url: item.image_url
        });
      }

      saveCartToLocalStorage();
      throw error;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 更新購物車商品數量
   */
  async function updateQuantity(itemId: number, quantity: number) {
    if (!userStore.isLoggedIn) return;

    //數量小於0就刪除
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    loading.value = true;
    try {
      const res = await axios.patch(`/api/cart/items/${itemId}`, {
        quantity
      }, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });

      if (res.data.code === 0) {
        // 更新本地狀態
        // 根據 itemId 找出商品在 items 陣列中的 index。
        // 找到就直接更新那個項目的 quantity。
        // 不用重新拉 API，避免多餘的請求，提升效率。
        const index = items.value.findIndex(item => item.id === itemId);
        if (index !== -1) {
          items.value[index].quantity = quantity;
        }
      }
    } catch (error) {
      console.error('更新數量失敗:', error);

      // 後端失敗時，臨時使用前端邏輯
      const index = items.value.findIndex(item => item.id === itemId);
      if (index !== -1) {
        items.value[index].quantity = quantity;
        saveCartToLocalStorage();
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * 從購物車移除商品
   */
  async function removeFromCart(itemId: number) {
    if (!userStore.isLoggedIn) return;

    loading.value = true;
    try {
      const res = await axios.delete(`/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });

      if (res.data.code === 0) {
        // 更新本地狀態
        items.value = items.value.filter(item => item.id !== itemId);
      }
    } catch (error) {
      console.error('移除商品失敗:', error);

      // 後端失敗時，臨時使用前端邏輯
      items.value = items.value.filter(item => item.id !== itemId);
      saveCartToLocalStorage();
    } finally {
      loading.value = false;
    }
  }

  /**
   * 清空購物車
   */
  async function clearCart() {
    if (!userStore.isLoggedIn) return;

    loading.value = true;
    try {
      const res = await axios.delete('/api/cart', {
        headers: { Authorization: `Bearer ${userStore.token}` }
      });

      if (res.data.code === 0) {
        // 清空本地狀態
        items.value = [];
      }
    } catch (error) {
      console.error('清空購物車失敗:', error);

      // 後端失敗時，臨時清空本地
      items.value = [];
      saveCartToLocalStorage();
    } finally {
      loading.value = false;
    }
  }

  /**
   * 保存購物車到localStorage (臨時方案，作為備份)
   */
  function saveCartToLocalStorage() {
    if (userStore.isLoggedIn) {
      localStorage.setItem(`cart_${userStore.account}`, JSON.stringify(items.value));
    }
  }

  /**
   * 從localStorage加載購物車 (臨時方案)
   */
  function loadCartFromLocalStorage() {
    if (userStore.isLoggedIn) {
      const savedCart = localStorage.getItem(`cart_${userStore.account}`);
      if (savedCart) {
        items.value = JSON.parse(savedCart);
      }
    }
  }

  return {
    items,//商品列表（包含每個商品的 id、數量、名稱、價格等）
    totalItems,//所有商品的總數量（quantity 加總）
    totalAmount,//購物車的總金額（price * quantity 加總）
    loading,//是否處於載入狀態（例如正在 call API，前端可根據它顯示 loading spinner）
    fetchCart,//從後端獲取購物車資料，若失敗則從 localStorage 撈資料備援
    addToCart,//加入商品到購物車，若後端失敗則前端臨時加上並寫入 localStorage
    updateQuantity,//更新購物車中某個商品的數量，若數量 <= 0 則自動轉為刪除
    removeFromCart,//移除某個商品（依 item.id 刪除），後端失敗時仍會在前端更新並寫入 localStorage
    clearCart,//清空整個購物車內容（後端或前端都會執行）
    loadCartFromLocalStorage//當無法從後端獲取資料時，從 localStorage 還原購物車狀態
  };
}, {
  persist: true //數據持久化
});
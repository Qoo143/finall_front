// src/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserInfoStore } from './user';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@/api/cart';

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
  const loading = ref(false); // 加載狀態

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
    // 檢查用戶是否已登入
    if (!userStore.isLoggedIn) return;

    loading.value = true;
    try {
      // 使用新的 API 模組方法
      const res = await getCart(userStore.token);

      // 處理響應數據
      if (res.data.code === 0) {
        items.value = res.data.data.items || [];
      }
    } catch (error) {
      console.error('獲取購物車失敗:', error);
      // 如果獲取失敗，嘗試從本地存儲加載
      loadCartFromLocalStorage();
    } finally {
      loading.value = false;
    }
  }

  /**
   * 加入購物車
   */
  async function addToCartItem(
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
      // 使用新的 API 模組方法
      const res = await addToCart(userStore.token, item.id, quantity);

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

    // 數量小於0就刪除
    if (quantity <= 0) {
      return removeCartItem(itemId);
    }

    loading.value = true;
    try {
      // 使用新的 API 模組方法
      const res = await updateCartItem(userStore.token, itemId, quantity);

      if (res.data.code === 0) {
        // 更新本地狀態
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
  async function removeCartItem(itemId: number) {
    if (!userStore.isLoggedIn) return;

    loading.value = true;
    try {
      // 使用新的 API 模組方法
      const res = await removeFromCart(userStore.token, itemId);

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
  async function clearCartItems() {
    if (!userStore.isLoggedIn) return;

    loading.value = true;
    try {
      // 使用新的 API 模組方法
      const res = await clearCart(userStore.token);

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
    items,
    totalItems,
    totalAmount,
    loading,
    fetchCart,
    addToCart: addToCartItem, // 重命名了方法，但保持外部接口一致
    updateQuantity,
    removeFromCart: removeCartItem, // 重命名了方法，但保持外部接口一致
    clearCart: clearCartItems, // 重命名了方法，但保持外部接口一致
    loadCartFromLocalStorage
  };
}, {
  persist: true //數據持久化
});
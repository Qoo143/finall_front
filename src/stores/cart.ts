// src/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserInfoStore } from './user';

// 定義購物車項目的介面
export interface CartItem {
  id: number;          // 商品ID
  name: string;        // 商品名稱
  price: number;       // 商品價格
  quantity: number;    // 購買數量
  image_url: string;   // 商品圖片
}

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserInfoStore();
  
  // 購物車商品列表
  const items = ref<CartItem[]>([]);
  
  // 計算購物車中的商品總數
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });
  
  // 計算購物車總金額
  const totalAmount = computed(() => {
    return items.value.reduce((total, item) => total + item.price * item.quantity, 0);
  });
  
  // 加入購物車
  function addToCart(item: Omit<CartItem, 'quantity'>, quantity: number) {
    // 檢查用戶是否已登入
    if (!userStore.isLoggedIn) {
      throw new Error('請先登入再加入購物車');
    }
    
    // 檢查商品是否已在購物車中
    const existingItemIndex = items.value.findIndex(i => i.id === item.id);
    
    if (existingItemIndex !== -1) {
      // 如果已存在，增加數量
      items.value[existingItemIndex].quantity += quantity;
    } else {
      // 如果不存在，添加新商品
      items.value.push({
        ...item,
        quantity
      });
    }
    
    // 將來這裡可以添加與後端API的同步
    saveCartToLocalStorage();
  }
  
  // 更新購物車商品數量
  function updateQuantity(itemId: number, quantity: number) {
    const index = items.value.findIndex(item => item.id === itemId);
    if (index !== -1) {
      if (quantity <= 0) {
        // 如果數量為0或負數，移除商品
        removeFromCart(itemId);
      } else {
        items.value[index].quantity = quantity;
        saveCartToLocalStorage();
      }
    }
  }
  
  // 從購物車移除商品
  function removeFromCart(itemId: number) {
    items.value = items.value.filter(item => item.id !== itemId);
    saveCartToLocalStorage();
  }
  
  // 清空購物車
  function clearCart() {
    items.value = [];
    saveCartToLocalStorage();
  }
  
  // 保存購物車到localStorage (臨時方案，待後端API完成後可改為API請求)
  function saveCartToLocalStorage() {
    if (userStore.isLoggedIn) {
      localStorage.setItem(`cart_${userStore.account}`, JSON.stringify(items.value));
    }
  }
  
  // 從localStorage加載購物車 (臨時方案)
  function loadCartFromLocalStorage() {
    if (userStore.isLoggedIn) {
      const savedCart = localStorage.getItem(`cart_${userStore.account}`);
      if (savedCart) {
        items.value = JSON.parse(savedCart);
      }
    }
  }
  
  // 初始化時自動加載購物車
  loadCartFromLocalStorage();
  
  return {
    items,
    totalItems,
    totalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCartFromLocalStorage
  };
}, {
  persist: true
});
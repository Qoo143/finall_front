import instance from "@/http/index";

// 定義購物車項目介面
interface CartItemRequest {
  productId: number;
  quantity: number;
}

// 定義購物車 API 功能

/**
 * 獲取用戶購物車內容
 * @param token 用戶令牌
 * @returns 購物車資料的 Promise
 */
export function getCart(token: string) {
  return instance({
    url: "/api/cart",
    method: "GET",
    headers: {
      Authorization: `${token}`,
    }
  });
}

/**
 * 添加商品到購物車
 * @param token 用戶令牌
 * @param productId 商品 ID
 * @param quantity 添加數量
 * @returns 操作結果的 Promise
 */
export function addToCart(token: string, productId: number, quantity: number) {
  return instance({
    url: "/api/cart/items",
    method: "POST",
    data: {
      productId,
      quantity
    },
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json"
    }
  });
}

/**
 * 更新購物車商品數量
 * @param token 用戶令牌
 * @param itemId 購物車項目 ID
 * @param quantity 新數量
 * @returns 操作結果的 Promise
 */
export function updateCartItem(token: string, itemId: number, quantity: number) {
  return instance({
    url: `/api/cart/items/${itemId}`,
    method: "PATCH",
    data: {
      quantity
    },
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json"
    }
  });
}

/**
 * 從購物車移除商品
 * @param token 用戶令牌
 * @param itemId 購物車項目 ID
 * @returns 操作結果的 Promise
 */
export function removeFromCart(token: string, itemId: number) {
  return instance({
    url: `/api/cart/items/${itemId}`,
    method: "DELETE",
    headers: {
      Authorization: `${token}`
    }
  });
}

/**
 * 清空購物車
 * @param token 用戶令牌
 * @returns 操作結果的 Promise
 */
export function clearCart(token: string) {
  return instance({
    url: "/api/cart",
    method: "DELETE",
    headers: {
      Authorization: `${token}`
    }
  });
}
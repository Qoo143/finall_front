import instance from "@/http/index";

/**
 * 創建新訂單
 * @param token 用戶令牌
 * @param orderData 訂單數據
 * @returns 操作結果的 Promise
 */
export function createOrder(token: string, orderData: any) {
  return instance({
    url: "/api/orders",
    method: "POST",
    data: orderData,
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    }
  });
}

/**
 * 獲取用戶所有訂單
 * @param token 用戶令牌
 * @returns 訂單數據的 Promise
 */
export function getUserOrders(token: string) {
  return instance({
    url: "/api/orders",
    method: "GET",
    headers: {
      Authorization: token
    }
  });
}

/**
 * 獲取訂單詳情
 * @param token 用戶令牌
 * @param orderId 訂單ID
 * @returns 訂單詳情的 Promise
 */
export function getOrderDetail(token: string, orderId: number) {
  return instance({
    url: `/api/orders/${orderId}`,
    method: "GET",
    headers: {
      Authorization: token
    }
  });
}

/**
 * 取消訂單
 * @param token 用戶令牌
 * @param orderId 訂單ID
 * @returns 操作結果的 Promise
 */
export function cancelOrder(token: string, orderId: number) {
  return instance({
    url: `/api/orders/${orderId}/cancel`,
    method: "PATCH",
    headers: {
      Authorization: token
    }
  });
}
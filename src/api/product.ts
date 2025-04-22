import instance from "@/http/index";
import type { ProductApiResponse } from "@/types/productApiResponse";

// 取得商品資料
export function getProduct(id: string): Promise<{ data: ProductApiResponse }> {
  return instance({
    url: `/products/${id}`,
    method: "GET",
  });
}

// 新增商品
export function createProduct(data: FormData) {
  return instance({
    url: "/products",
    method: "POST",
    data,
    headers: {
      "Content-Type": "multipart/form-data", // ✅ 為了支援 FormData 傳檔案
    },
  });
}

// 更新商品
export function updateProduct(id: string, data: FormData) {
  return instance({
    url: `/products/${id}`,
    method: "PUT",
    data,
    headers: {
      "Content-Type": "multipart/form-data", // ✅ 同上
    },
  });
}

//取得所有商品標籤
export function getTags() {
  return instance({
    url: `/tags`,
    method: "GET",
    headers: {
      // "Content-Type": "multipart/form-data", // ✅ 同上
    },
  });
}

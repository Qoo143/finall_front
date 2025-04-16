// /api/product.ts
import axios from "axios";

export function getProduct(id: string) {
  return axios.get(`http://127.0.0.1:3007/products/${id}`);
}

export function createProduct(data: FormData) {
  return axios.post("http://127.0.0.1:3007/products", data);
}

export function updateProduct(id: string, data: FormData) {
  return axios.put(`http://127.0.0.1:3007/products/${id}`, data);
}

import type { Vector3 } from "@/types/product";


// src/types/productApiResponse.ts

export interface ImageData {
  id: number;
  file: string; // 後端返回URL
  is_main: boolean; // 後端返回布林值
}

export interface Camera {
  position: Vector3;
  target: Vector3;
}
export interface ModelData {
  model_url: string;
  camera: Camera;
}

export interface ProductApiResponse {
  basicInfo: {
    id: number;
    name: string;
    price: number;
    stock: number;
    is_active: boolean;
    tagIds: number[],
    tagNames: string[],
    category_id: number | null;
    description: string;
  }
  images: ImageData[];
  model?: ModelData | null;
}

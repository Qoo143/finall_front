import type { Vector3 } from "@/types/product";


// src/types/productApiResponse.ts
export interface Tag {
  id: number;
  name: string;
}

export interface ImageData {
  id: number;
  image_url: string;
  is_main: number;
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
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: number;
  category_id: number;
  description: string;
  tags: Tag[] | [];
  images: ImageData[] | [];
  model?: ModelData | null;
}

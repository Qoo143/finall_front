import type { Vector3 } from "@/types/product";


// src/types/productApiResponse.ts

export interface ImageData {
  id: number;
  image_url: string;
  is_main: number;
}

export interface Camera {
  position: Vector3 | {};
  target: Vector3 | {};
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
  images: ImageData[] | [];
  model?: ModelData | null;
}

// basicInfo: {
//   name: string;
//   price: number;
//   stock: number;
//   is_active: boolean; //是否上架
//   tagIds: number[];
//   tagNames: string[]; //用來給渲染畫面
//   category_id: number | null; //可能沒有
//   description: string; //涵蓋空字串
// };
// model: {
//   glb: string  | null; //? 確認是否只傳連結
//   camera: {
//     position: Vector3;
//     target: Vector3;
//   };
// };
// images: {
//   id: number;//刪除圖片用
//   image_url: string; // ✅ 回傳為圖片 URL
//   is_main: boolean;
// }[];// 空陣列代表沒有圖片

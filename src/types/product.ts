import type { ImageData } from './productApiResponse'; // 或你放的位置
//這是manage存的商品格式資料

//保存格式
export interface ProductData {
  id: number | null;
  name: string;
  price: number;
  stock: number;
  is_active: number; //是否上架
  tagIds: number[];
  tagNames: string[]; //用來給渲染畫面
  category_id: number; //可能沒有
  description: string;

  model_url: string | null;  // 數據庫保存的模型URL
  model_file: File | null;   // 僅前端使用，用於上傳

  images: ImageData[] | [];// 空陣列代表沒有圖片
}

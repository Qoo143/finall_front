
export interface ImageData {
  id: number | null;
  file: string | File; // 後端返回URL
  is_main: number; //1才是主圖
}

//傳回格式
export interface ProductApiResponse {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: number;
  tagIds: number[],
  tagNames: string[],
  category_id: number;
  description: string;
  images: ImageData[];
  model_url: string | null;
}

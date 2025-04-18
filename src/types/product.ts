//three.js存視角格式
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}
//這是manage存的商品格式資料
export interface ProductData {
  basicInfo: {
    id: number | null;
    name: string;
    price: number;
    stock: number;
    is_active: boolean; //是否上架
    tagIds: number[];
    tagNames: string[]; //用來給渲染畫面
    category_id: number | null; //可能沒有
    description: string; //涵蓋空字串
  };
  model: {
    glb: string;
    camera: {
      position: Vector3;
      target: Vector3;
    };
  } | null;//[]還需確認格式
  images: {
    id: number;//刪除圖片用
    file: string | File; // 既可以是URL字串(从后端獲取)，也可以是File物件(前端上傳)
    is_main: boolean;
  }[] | [];// 空陣列代表沒有圖片
}

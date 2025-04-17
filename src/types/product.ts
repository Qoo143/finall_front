export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ProductData {
  basicInfo: {
    name: string;
    price: number;
    stock: number;
    isListed: boolean; //是否上架
    tagIds: number[];
    tagNames: string[]; //用來給渲染畫面
    categoryId: number | null; //可能沒有
    description: string; //涵蓋空字串
  };
  model: {
    glb: File | null;
    camera: {
      position: Vector3;
      target: Vector3;
    };
  };
  images: {
    id: number;//刪除圖片用
    file: string; // ✅ 回傳為圖片 URL
    isMain: boolean;
  }[];// 空陣列代表沒有圖片
}

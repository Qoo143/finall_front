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
    isListed: boolean;
    tagIds: number[];
    tagNames: string[];
    categoryId: number | null;
    description: string;
  };
  model: {
    glb: File | null;
    camera: {
      position: Vector3;
      target: Vector3;
    };
  };
  images: {
    file: File;
    isMain: boolean;
  }[];
}
<template>
  <div class="productManage-grid">
    <div class="item header">
      <div>編輯頁面</div>
    </div>

    <!-- 基本資料區 -->
    <div class="item topPartA">
      <ProductBasicInfo
        v-model="productData.basicInfo"
        :createMode="!isEditMode"
      />
    </div>

    <!-- 文本描述區 -->
    <div class="item topPartB">
      <ProductDescription v-model="productData.basicInfo" />
    </div>

    <!-- 3D模型區 -->
    <div class="item topPartC">
      <ProductModelUpload v-model="productData.model" />
    </div>

    <!-- 2D圖片區 -->
    <div class="item imageSection">
      <ProductImageUpload v-model="productData.images" />
    </div>

    <!-- 提交按鈕區 -->
    <div class="item submitSection">
      <ProductSubmitBar :createMode="!isEditMode" :submitFn="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
// --------------------<<import>>--------------------
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getProduct, createProduct, updateProduct } from "@/api/product";
import { ElMessage } from "element-plus";

import ProductBasicInfo from "./components/ProductBasicInfo.vue";
import ProductModelUpload from "./components/ProductModelUpload.vue";
import ProductImageUpload from "./components/ProductImageUpload.vue";
import ProductSubmitBar from "./components/ProductSubmitBar.vue";
import ProductDescription from "./components/ProductDescription.vue";

import type { ProductData } from "@/types/product"; //大資料物件ts
// --------------------<<狀態管理>>--------------------
const route = useRoute();
const isEditMode = computed(() => !!route.params.id); //監測有沒有動態id

//大資料物件
const productData = ref<ProductData>({
  basicInfo: {
    id: null,
    name: "",
    price: 0,
    stock: 0,
    is_active: false, //預設不上架
    tagIds: [],
    tagNames: [],
    category_id: null,
    description: "",
  },
  model: {
    glb: "",
    camera: {
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      //可以考慮擴充scale
    },
  },
  images: [],
});

// --------------------🔃 初始化資料--------------------
//若是編輯模式則起動渲染帶入資料
onMounted(() => {
  if (isEditMode.value) {
    fetchProduct(route.params.id as string);
  }
});

const fetchProduct = async (id: string) => {
  try {
    const { data } = await getProduct(id);
    console.log("API返回的完整數據:", JSON.stringify(data, null, 2));

    // 確保每個屬性都正確對應，並進行必要的類型轉換
    productData.value = {
      basicInfo: {
        id: data.basicInfo.id,
        name: data.basicInfo?.name ?? "", // 使用空值合併運算符
        price: data.basicInfo?.price ?? 0, // 如果值為 null 或 undefined，則使用預設值 0
        stock: Number(data.basicInfo?.stock) ?? 0,
        is_active: Boolean(data.basicInfo?.is_active), // Boolean 轉換已經處理 null/undefined
        tagIds: Array.isArray(data.basicInfo?.tagIds)
          ? data.basicInfo.tagIds
          : [],
        tagNames: Array.isArray(data.basicInfo?.tagNames)
          ? data.basicInfo.tagNames
          : [],
        category_id: data.basicInfo?.category_id ?? null, // 如果分類ID不存在，則為 null
        description: data.basicInfo?.description ?? "", // 如果描述不存在，則為空字串
      },
      model: {
        glb: null, // 前端通常不會從 API 接收文件對象，所以設為 null
        camera: {
          position: {
            x: 0, // 使用可選鏈和空值合併確保安全存取
            y: 0,
            z: 0,
          },
          target: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      },
      images: Array.isArray(data.images)
        ? data.images.map((img) => ({
            id: img.id ?? 0, // 使用空值合併運算符
            image_url: img.image_url ?? null,
            is_main: Boolean(img.is_main),
          }))
        : [],
    };

    console.log("✅ 成功載入 productData", productData.value);
  } catch (err) {
    console.error("❌ 載入商品資料失敗", err);
  }
};

// --------------------📤 提交資料--------------------
const handleSubmit = async () => {
  try {
    const formData: any = new FormData();
    const { basicInfo, model, images } = productData.value;

    // ✅ 基本欄位
    formData.append("name", basicInfo.name);
    formData.append("price", basicInfo.price.toString());
    formData.append("stock", basicInfo.stock.toString());
    formData.append("status", basicInfo.is_active ? "1" : "0");
    formData.append("category_id", String(basicInfo.category_id));
    formData.append("description", basicInfo.description || "");

    // ✅ 標籤（陣列）
    basicInfo.tagIds.forEach((id) => {
      formData.append("tag_ids[]", String(id));
    });

    // ✅ 圖片（只傳 File）
    images.forEach((img: any) => {
      if (img.image_url) {
        formData.append("images", img.file);
        formData.append("is_main_flags[]", img.isMain ? "1" : "0");
      }
    });

    // ✅ 模型（選填）
    if (model && model.glb) {
      formData.append("glb", model.glb);
    }
    if (model && model.camera) {
      formData.append("camera_position", JSON.stringify(model.camera.position));
      formData.append("camera_target", JSON.stringify(model.camera.target));
    }
    // 檢查傳值
    // for (const [key, value] of formData.entries()) {
    //   console.log("📦 送出資料：", key, value);
    // }
    // ✅ 呼叫 API
    if (isEditMode.value) {
      await updateProduct(route.params.id as string, formData);
      alert("✅ 商品更新成功！");
    } else {
      await createProduct(formData);
      ElMessage.success("商品新增成功！");
    }
  } catch (err) {
    console.error("❌ 商品提交失敗", err);
    ElMessage.error("提交失敗，請稍後再試");
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/css/common.scss";

.productManage-grid {
  display: grid;
  grid-template-columns: minmax(250px, 25%) minmax(500px, 45%) minmax(
      250px,
      30%
    );
  grid-auto-rows: auto;

  gap: 16px;

  .item {
    background-color: $bg-1;
    padding: 24px;
    border-radius: 16px;
  }

  .header {
    background-color: $bg-3;
    grid-column: span 3;
    font-size: 32px;
    padding: 0px;
    height: 42px;
    font-weight: 600;
    position: relative;
    color: $primary-b-d;
    justify-content: center;

    &::before {
      content: "";
      position: absolute;

      left: -12px;
      top: 0;
      width: 5px;
      height: 60%;
      transform: translateY(40%);
      background-color: $primary-y;
      align-items: center;
      border-radius: 2px;
    }
    hr {
      position: relative;
      margin: 16px;
      width: 100%;
      left: -16px;
      color: $text-ll;
    }
  }
  .imageSection {
    grid-column: span 3;
    display: flex;
    align-items: center;
  }

  .submitSection {
    grid-column: span 3;
    background-color: $bg-3;
    padding: 0;
  }
}
</style>

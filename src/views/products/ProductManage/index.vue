<template>
  <div class="productManage-grid">
    <div class="item header">
      <div>編輯頁面</div>
    </div>
    <div class="item topPartA">
      <ProductBasicInfo
        v-model="productData.basicInfo"
        :createMode="!isEditMode"
      />
    </div>

    <div class="item topPartB">
      <ProductDescription v-model="productData.basicInfo" />
    </div>

    <div class="item topPartC">
      <ProductModelUpload v-model="productData.model" />
    </div>

    <div class="item imageSection">
      <ProductImageUpload v-model="productData.images" />
    </div>

    <!-- 傳上傳fn給子組件 -->
    <div class="item submitSection">
      <ProductSubmitBar :createMode="!isEditMode" :submitFn="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
// --------------------📦 import--------------------
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import ProductBasicInfo from "./components/ProductBasicInfo.vue";
import ProductModelUpload from "./components/ProductModelUpload.vue";
import ProductImageUpload from "./components/ProductImageUpload.vue";
import ProductSubmitBar from "./components/ProductSubmitBar.vue";
import ProductDescription from "./components/ProductDescription.vue";

import type { ProductData } from "@/types/product"; //大資料物件ts
import { getProduct, createProduct, updateProduct } from "@/api/product";
import { ElMessage } from "element-plus";

// --------------------🧠 狀態管理--------------------
const route = useRoute();
const isEditMode = computed(() => !!route.params.id);

//大資料物件
const productData = ref<ProductData>({
  basicInfo: {
    name: "",
    price: 0,
    stock: 0,
    isListed: false,
    tagIds: [],
    tagNames: [],
    categoryId: null,
    description: "",
  },
  model: {
    glb: null,
    camera: {
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
    },
  },
  images: [],
});

// --------------------🔃 初始化資料--------------------
//若是編輯模式則起動渲染
onMounted(() => {
  if (isEditMode.value) fetchProduct(route.params.id as string);
});

const fetchProduct = async (id: string) => {
  try {
    const res = await getProduct(id);
    const data = res.data.data;

    const tags = data.tags || [];

    productData.value.basicInfo = {
      name: data.name,
      price: data.price,
      stock: data.stock,
      isListed: data.status === 1,
      tagIds: tags.map((t: any) => t.id),
      tagNames: tags.map((t: any) => t.name),
      categoryId: data.category_id,
      description: data.description || "",
    };

    productData.value.model = {
      glb: null, // 編輯時不重新載入檔案本體（除非支援 URL -> File）
      camera: data.model_camera || {
        position: { x: 0, y: 0, z: 0 },
        target: { x: 0, y: 0, z: 0 },
      },
    };

    productData.value.images = (data.images || []).map((img: any) => ({
      file: img.url, // 若你要回傳為 URL 顯示預覽（不上傳新檔）
      isMain: img.is_main === 1,
    }));

    // ---測試
    console.log("從 API 拿到資料：", data);
    console.log("填入後的 productData：", productData.value);
    // ---測試
  } catch (err) {
    console.error("載入商品失敗", err);
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
    formData.append("status", basicInfo.isListed ? "1" : "0");
    formData.append("category_id", String(basicInfo.categoryId));
    formData.append("description", basicInfo.description || "");

    // ✅ 標籤（陣列）
    basicInfo.tagIds.forEach((id) => {
      formData.append("tag_ids[]", String(id));
    });

    // ✅ 圖片（只傳 File）
    images.forEach((img) => {
      if (img.file instanceof File) {
        formData.append("images", img.file);
        formData.append("is_main_flags[]", img.isMain ? "1" : "0");
      }
    });

    // ✅ 模型（選填）
    if (model.glb) {
      formData.append("glb", model.glb);
    }
    if (model.camera) {
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

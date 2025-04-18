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

// 在 fetchProduct 後記錄原始圖片ID
const originalImageIds = ref<number[]>([]);

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

    // 記錄原始圖片ID
    if (Array.isArray(data.images)) {
      originalImageIds.value = data.images
        .map((img) => img.id)
        .filter((id) => id);
    }

    // 確保每個屬性都正確對應，並進行必要的類型轉換
    productData.value = {
      basicInfo: {
        id: data.basicInfo?.id ?? null,
        name: data.basicInfo?.name ?? "",
        price: Number(data.basicInfo?.price) ?? 0,
        stock: Number(data.basicInfo?.stock) ?? 0,
        is_active: Boolean(data.basicInfo?.is_active),
        tagIds: Array.isArray(data.basicInfo?.tagIds)
          ? data.basicInfo.tagIds
          : [],
        tagNames: Array.isArray(data.basicInfo?.tagNames)
          ? data.basicInfo.tagNames
          : [],
        category_id: data.basicInfo?.category_id ?? null, // 注意字段名转换
        description: data.basicInfo?.description ?? "",
      },
      // 如果model为null，整个model属性设为null
      model: data.model
        ? {
            glb: data.model.model_url ?? null,
            camera: {
              position: {
                x: data.model.camera?.position?.x ?? 0,
                y: data.model.camera?.position?.y ?? 0,
                z: data.model.camera?.position?.z ?? 0,
              },
              target: {
                x: data.model.camera?.target?.x ?? 0,
                y: data.model.camera?.target?.y ?? 0,
                z: data.model.camera?.target?.z ?? 0,
              },
            },
          }
        : null,
      // 将API返回的image_url映射到file字段
      images: Array.isArray(data.images)
        ? data.images.map((img) => ({
            id: img.id ?? 0,
            file: img.file ?? "", // 将image_url值赋给file
            is_main: img.is_main, // 将number转为boolean
          }))
        : [],
    };

    console.log("✅ 成功加載 productData", productData.value);
  } catch (err) {
    console.error("❌ 加載商品資料失敗", err);
  }
};

// --------------------📤 提交資料--------------------
const handleSubmit = async () => {
  try {
    const formData = new FormData();
    const { basicInfo, images } = productData.value;

    // 1. 基本商品信息 - 简单扁平结构
    formData.append("name", basicInfo.name);
    formData.append("price", basicInfo.price.toString());
    formData.append("stock", basicInfo.stock.toString());
    formData.append("is_active", basicInfo.is_active ? "1" : "0");
    formData.append(
      "category_id",
      basicInfo.category_id ? String(basicInfo.category_id) : ""
    );
    formData.append("description", basicInfo.description || "");

    // 2. 标签IDs - 简单数组结构
    // 直接传递JSON字符串，避免使用多个同名字段
    formData.append("tag_ids", JSON.stringify(basicInfo.tagIds));

    // 3. 图片处理 - 统一格式
    if (isEditMode.value) {
      // 3.1 现有图片 - 使用JSON字符串
      const existingImagesData = images
        .filter((img) => typeof img.file === "string" && img.id)
        .map((img) => ({
          id: img.id,
          is_main: img.is_main ? 1 : 0,
          file: img.file, // 保存URL，以便后端参考
        }));

      formData.append("existing_images", JSON.stringify(existingImagesData));

      // 3.2 要删除的图片IDs
      const currentImageIds = existingImagesData.map((img) => img.id);
      const deletedImageIds = originalImageIds.value.filter(
        (id) => !currentImageIds.includes(id)
      );

      formData.append("deleted_image_ids", JSON.stringify(deletedImageIds));
    }

    // 3.3 新上传的图片 - 统一命名
    const newImages = images.filter((img) => img.file instanceof File);

    // 将新图片信息一次性传递，避免多个is_main标记
    const newImagesInfo = newImages.map((img) => ({
      is_main: img.is_main ? 1 : 0,
    }));
    formData.append("new_images_info", JSON.stringify(newImagesInfo));

    // 添加所有新图片文件
    newImages.forEach((img, index) => {
      // 使用索引区分多个图片文件
      formData.append(`image_${index}`, img.file);
    });

    // 调试信息
    console.log("表单基本信息:", {
      name: basicInfo.name,
      price: basicInfo.price,
      stock: basicInfo.stock,
      is_active: basicInfo.is_active ? "1" : "0",
      category_id: basicInfo.category_id || "",
      tag_ids: JSON.stringify(basicInfo.tagIds),
      existing_images: formData.get("existing_images"),
      deleted_image_ids: formData.get("deleted_image_ids"),
      new_images_count: newImages.length,
    });

    // 调用API
    if (isEditMode.value) {
      try {
        const response:any = await updateProduct(
          route.params.id as string,
          formData
        );
        console.log("完整API响应:", response);

        // 验证响应内容
        if (response.code === 0) {
          // 假设code=0表示成功
          ElMessage.success("商品更新成功！");
        } else {
          ElMessage.warning(`操作返回：${response.message || "未知状态"}`);
        }
      } catch (err) {
        console.error("❌ 商品提交失败", err);
        ElMessage.error("提交失败，请稍后再试");
      }
    }
  } catch (err) {
    console.error("商品提交失败", err);
    ElMessage.error("提交失败，请稍后再试");
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

<template>
  <div class="product-manage-container">
    <!-- 上半區塊：基本資料 + 模型 -->
    <div class="top-section">
      <div class="left">
        <ProductBasicInfo v-model="productData.basicInfo" />
      </div>
      <div class="right">
        <ProductModelUpload v-model="productData.model" />
      </div>
    </div>

    <!-- 圖片上傳區 -->
    <div class="image-section">
      <ProductImageUpload v-model="productData.images" />
    </div>

    <!-- 確認按鈕 -->
    <div class="submit-section">
      <ProductSubmitBar :isEditMode="isEditMode" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import ProductBasicInfo from "./components/ProductBasicInfo.vue";
import ProductModelUpload from "./components/ProductModelUpload.vue";
import ProductImageUpload from "./components/ProductImageUpload.vue";
import ProductSubmitBar from "./components/ProductSubmitBar.vue";

const route = useRoute();
const isEditMode = computed(() => !!route.params.id);

const productData = ref({
  basicInfo: {
    name: "",
    price: 0,
    stock: 0,
    isListed: false,
    tagIds: [],
  },
  model: {
    glb: null,
    camera: {
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
    },
  },
  images: [] as { file: File; isMain: boolean }[],
});

onMounted(() => {
  if (isEditMode.value) {
    fetchProduct(route.params.id as string);
  }
});

function fetchProduct(id: string) {
  // TODO: 拉取資料並填入 productData
}

function handleSubmit() {
  // TODO: 提交 productData
  console.log("送出資料", productData.value);
}
</script>

<style scoped lang="scss">
.product-manage-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
}

/* 上半：基本 + 模型 */
.top-section {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.left {
  flex: 0 0 30%;
  min-width: 280px;
}

.right {
  flex: 1;
  min-width: 400px;
}

/* 中段：圖片區 */
.image-section {
  width: 100%;
}

/* 下段：送出按鈕 */
.submit-section {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>

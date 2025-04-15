<template>
  <div class="productManage-grid">
    <div class="item header">
      <div>編輯頁面</div>
      <div class="line"></div>
    </div>
    <div class="item topPartA">
      <ProductBasicInfo v-model="productData.basicInfo" />
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

    <div class="item submitSection">
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
import ProductDescription from "./components/ProductDescription.vue";

const route = useRoute();
const isEditMode = computed(() => !!route.params.id);

//這是最終收集到資料的物件
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
@import "@/assets/css/common.scss";

.productManage-grid {
  display: grid;
  grid-template-columns: minmax(250px, 25%) minmax(250px, 25%) minmax(
      450px,
      50%
    );
  grid-auto-rows: auto;
  gap: 16px;

  .item {
    background-color: $bg-1;
    padding: 16px;
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
  }

  .submitSection {
    grid-column: span 3;
  }
}
</style>

<template>
  <div class="productManage-grid">
    <div class="item header">
      <div>編輯頁面</div>
    </div>
    <!-- 基本資料 -->
    <div class="item topPartA">
      <ProductBasicInfo v-model="productData" :createMode="!isEditMode" />
    </div>
    <!-- 描述 -->
    <div class="item topPartB">
      <ProductDescription v-model="productData" />
    </div>

    <!-- 模型 -->
    <div class="item topPartC">
      <ProductModelUpload v-model="productData" />
    </div>

    <!-- 圖片 -->
    <div class="item imageSection">
      <ProductImageUpload
        v-model:images="productData.images"
        v-model:deletedIds="deletedImageIds"
      />
    </div>

    <!-- 提交 -->
    <div class="item submitSection">
      <ProductSubmitBar
        :createMode="!isEditMode"
        :submitFn="handleSubmit"
        :isSubmitting="isSubmitting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";

import ProductBasicInfo from "./components/ProductBasicInfo.vue";
import ProductDescription from "./components/ProductDescription.vue";
import ProductModelUpload from "./components/ProductModelUpload.vue";
import ProductImageUpload from "./components/ProductImageUpload.vue";
import ProductSubmitBar from "./components/ProductSubmitBar.vue";

import {
  getProduct,
  createProduct,
  updateProduct,
  getTags,
} from "@/api/product";
import type { ProductData } from "@/types/product";

const route = useRoute();
const router = useRouter();
const isEditMode = computed(() => !!route.params.id);
/**
 *  基礎預設資料 (創建資料帶入)
 */
const productData = ref<ProductData>({
  id: null,
  name: "",
  price: 0,
  stock: 0,
  is_active: 0,
  tagIds: [],
  tagNames: [],
  category_id: 1,
  description: "",
  model_url: null, // 數據庫保存的模型URL
  model_file: null, // 僅前端使用，用於上傳
  images: [],
});
const isSubmitting = ref(false); //防止重複提交開關
//----------<<初始準備>>----------
/**
 *  1-1.若網址帶參數則刷新頁面
 *  1-2.所有標籤資料存到 allTags
 */
onMounted(async () => {
  await fetchAllTags();
  if (isEditMode.value) fetchProduct(route.params.id as string);
});
/**
 *  抓標籤fn
 */
const allTags = ref<{ id: number; name: string }[]>([]);
async function fetchAllTags() {
  const res = await getTags();
  allTags.value = res.data || [];
  // console.log("標籤資料 allTags.value 是：", allTags.value);//抓錯用
}
/**
 *  帶入商品參數資料fn
 */
async function fetchProduct(id: string) {
  const { data } = await getProduct(id);
  console.log("從後端拿的資料", data);

  productData.value = {
    id: data.id,
    name: data.name,
    price: data.price,
    stock: data.stock,
    is_active: data.is_active,
    tagIds: data.tagIds || [],
    tagNames: data.tagNames || [],
    category_id: data.category_id || 1,
    description: data.description || "",
    model_url: data.model_url || null, // 保存後端返回的URL
    model_file: null, // 初始化為null，等用戶上傳
    images: data.images.map((img: any) => ({
      id: img.id,
      file: img.file,
      is_main: img.is_main,
    })),
  };
}

/**
 * 把「使用者輸入的文字標籤」全部轉換成「對應的數字 id」
 */
async function resolveTagIdsFromNames(tagNames: string[]): Promise<number[]> {
  //將已知tag轉換格式
  const existingMap = new Map(allTags.value.map((tag) => [tag.name, tag.id]));

  const newNames: string[] = []; //保存新名子(存字串)
  const resolvedIds: number[] = []; //要建立連結的標籤id

  //開始遍歷-用戶輸入之字串標籤陣列
  for (const name of tagNames) {
    const id = existingMap.get(name); //利用該字串先找看看是否有匹配id
    if (id) resolvedIds.push(id); //若有就是維持不動
    else newNames.push(name); //若沒對應id 就要push到新字串陣列
  }

  //若有新標籤要處理
  if (newNames.length > 0) {
    //把新字串陣列傳到後端
    const res = await axios.post("http://localhost:3007/tags/patch", {
      names: newNames,
    });
    //後端傳回
    // {
    // 	"data": [ 8, 17 ],
    // 	"message": "操作成功",
    // 	"code": 0
    // }
    const newTags = res.data.data; //此時newTags是陣列
    allTags.value.push(...newTags); //推入新建標籤之id，是避免同頁編輯重複送出

    const resolveTag = newTags.map((item: any) => item.id);
    resolvedIds.push(...resolveTag); //將取得id推入當前商品標籤要擁有的值
  }
  return resolvedIds; //ex:[ 4, 5 ]
}
/**
 *  2.準備處理刪除照片之佔存區
 */
const deletedImageIds = ref<number[]>([]); //存要刪除之圖片id區
/**
 *  3.處理FormData資料提交
 */
const handleSubmit = async () => {
  // 如果正在提交中，中斷請求
  if (isSubmitting.value) {
    return ElMessage.warning("請勿重複提交");
  }
  try {
    // 設置提交狀態
    isSubmitting.value = true;

    const formData: any = new FormData();
    const info = productData.value; //目前v-model綁定值

    formData.append("name", info.name);
    formData.append("price", info.price.toString());
    formData.append("stock", info.stock.toString());
    formData.append("is_active", info.is_active ? "1" : "0");
    formData.append("category_id", info.category_id?.toString() || "1");
    formData.append("description", info.description || "");
    /**
     *  1.標籤 (全部清除+全部建立)
     */
    const tagIds = await resolveTagIdsFromNames(info.tagNames);
    tagIds.forEach((id) => formData.append("tagIds[]", id.toString()));
    /**
     *  2.圖片處理
     */
    info.images.forEach((img, index) => {
      //判斷是否為新上傳
      if (img.file instanceof File) {
        formData.append(`images[]`, img.file);
      } else {
        formData.append(`images[]`, null);
      }
      formData.append(`image_id[]`, (img.id || 0).toString());
      formData.append(`image_is_main[]`, img.is_main ? "1" : "0");
    });

    /**
     *  2-1.傳送被刪除的舊圖 id(由後端推入)
     */
    deletedImageIds.value.forEach((id) => {
      formData.append("deleted_image_ids[]", id.toString());
    });

    /**
     * 3.模型上傳確認
     */
    // 處理模型文件
    if (productData.value.model_file) {
      // 如果有新上傳的文件，添加到formData
      formData.append("model", productData.value.model_file);
    } else if (productData.value.model_url === null) {
      // 如果model_url為null且沒有新文件，標記為刪除舊模型
      formData.append("delete_model", "1");
    }
    // 如果model_url有值但沒有新文件，保持現有模型不變
    //------ 確認所有form鍵值對
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    //------
    // 提交 API
    const res: any = isEditMode.value
      ? await updateProduct(info.id!.toString(), formData)
      : await createProduct(formData);
    /**
     * 成功
     */
    if (res.code === 0) {
      // 1. 顯示成功消息
      ElMessage.success(isEditMode.value ? "商品更新成功" : "商品建立成功");
      // 2. 清空刪除圖片記錄（防止重複刪除）
      deletedImageIds.value = [];
      // 3. 根據模式選擇後續操作
      if (isEditMode.value) {
        // 編輯模式：刷新當前商品數據
        await fetchProduct(info.id!.toString());
      } else {
        router.push("/products");
      }
    } else {
      /**
       * 失敗
       */
      ElMessage.warning(res.message || "操作失敗");
    }
  } catch (err: any) {
    console.error("提交失敗", err);
    if (err.response) {
      console.error("後端回傳錯誤資訊：", err.response.data);
    }
    ElMessage.error("提交失敗，請稍後再試");
  } finally {
    // 恢復提交狀態
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/css/common.scss";

.productManage-grid {
  display: grid;
  grid-template-columns:
    minmax(300px, 33%)
    minmax(300px, 33%)
    minmax(300px, 33%);
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

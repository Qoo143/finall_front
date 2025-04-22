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
        v-model="productData.images"
        @delete-image-id="handleDeletedImageId"
      />
    </div>

    <!-- 提交 -->
    <div class="item submitSection">
      <ProductSubmitBar :createMode="!isEditMode" :submitFn="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
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
const isEditMode = computed(() => !!route.params.id);

//基礎預設資料 (創建資料帶入)
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
  model: null,
  images: [],
});

//----------<<初始準備>>----------
/*
 **  1-1.若網址帶參數則刷新頁面
 **  1-2.所有標籤資料存到 allTags
 */
onMounted(async () => {
  await fetchAllTags();
  if (isEditMode.value) fetchProduct(route.params.id as string);
});
/*
 ** 抓標籤fn
 */
const allTags = ref<{ id: number; name: string }[]>([]);
async function fetchAllTags() {
  const res = await getTags();
  allTags.value = res.data || [];
  console.log("標籤資料 allTags.value 是：", allTags.value);
}
/*
 ** 帶入商品參數資料fn
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
    model: data.model || null, //null還是""待確認
    images: data.images.map((img: any) => ({
      id: img.id,
      file: img.image_url,
      is_main: img.is_main,
    })),
  };
}
/*
 **  2.準備處理刪除照片之cb
 */
const deletedImageIds = ref<number[]>([]); //存要刪除之圖片id區
//可推入要刪除照片之id
const handleDeletedImageId = (id: number) => {
  if (id) {
    deletedImageIds.value.push(id);
  }
};

/*
 ** 把「使用者輸入的文字標籤」全部轉換成「對應的數字 id」
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
    const newTags = res.data; //此時newTags是陣列
    allTags.value.push(...newTags); //推入新建標籤之id，是避免同頁編輯重複送出

    const resolveTag = newTags.map((item: any) => {
      item.id; //此陣列只留id
    });
    resolvedIds.push(...resolveTag); //將取得id推入當前商品標籤要擁有的值
  }
  return resolvedIds; //ex:[ 4, 5 ]
}
/*
 **  3.處理FormData資料提交
 */
const handleSubmit = async () => {
  try {
    const formData: any = new FormData();
    const info = productData.value; //目前v-model綁定值

    formData.append("name", info.name);
    formData.append("price", info.price.toString());
    formData.append("stock", info.stock.toString());
    formData.append("is_active", info.is_active ? "1" : "0");
    formData.append("category_id", info.category_id?.toString() || "1");
    formData.append("description", info.description || "");

    // 標籤 (全部清除+全部建立)
    const tagIds = await resolveTagIdsFromNames(info.tagNames);
    tagIds.forEach((id) => formData.append("tagIds[]", id.toString()));

    // 圖片處理
    info.images.forEach((img, index) => {
      if (img.file instanceof File) {
        //判斷是否為新上傳
        formData.append(`images[${index}]`, img.file);
      }
      formData.append(`image_id[${index}]`, (img.id || 0).toString());
      formData.append(`image_is_main[${index}]`, img.is_main ? "1" : "0");
    });

    // 傳送被刪除的舊圖 id（後端要支援）
    deletedImageIds.value.forEach((id) => {
      formData.append("deleted_image_ids[]", id.toString());
    });
    //------
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    //------
    // 提交 API
    const res: any = isEditMode.value
      ? await updateProduct(info.id!.toString(), formData)
      : await createProduct(formData);

    if (res.code === 0) {
      ElMessage.success(isEditMode.value ? "商品更新成功" : "商品建立成功");
    } else {
      ElMessage.warning(res.message || "操作失敗");
    }
  } catch (err: any) {
    console.error("提交失敗", err);
    if (err.response) {
      console.error("後端回傳錯誤資訊：", err.response.data);
    }
    ElMessage.error("提交失敗，請稍後再試");
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

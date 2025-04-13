<template>
  <div class="breadcrumb">
    <template v-for="(item, index) in breadcrumbs" :key="index">
      <span v-if="index > 0"> / </span>
      <!-- 若非最後一個，則加上樣式與跳轉Fn -->
      <span
        v-if="index !== breadcrumbs.length - 1"
        class="clickable"
        @click="goTo(index)"
        >{{ item }}</span
      >
      <!-- 最後一個只有文字 -->
      <span v-else>{{ item }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { watch, ref } from "vue";

const route = useRoute(); //獲取路由資訊
const router = useRouter(); //執行跳轉goto()

const breadcrumbs = ref<string[]>([]); //儲存自訂meta陣列的值、裡面只有字串

watch(
  () => route.fullPath, //單一值要用return監聽
  () => {
    breadcrumbs.value = (route.meta.breadcrumb || []) as string[]; //附值自訂meta屬性
  },
  { immediate: true } //立即執行
);

//跳轉頁面 - 參數index可以用作後續判斷
function goTo(index: number) {
  //讀取路徑傳參 ":id"
  const id = route.params.id;

  //第一個回商品列表主頁
  //後續則判斷目前所在路由，動態添加router
  if (index === 0) {
    router.push("/products");
  } else if (index === 1) {
    if (route.name === "ProductCreate") router.push("/products/new");
    if (route.name === "ProductEdit") router.push(`/products/${id}/edit`);
    if (route.name === "ProductImageEdit")
      router.push(`/products/${id}/images`);
  }
}
</script>

<style scoped lang="scss">
.breadcrumb {
  font-size: 14px;

  .clickable {
    cursor: pointer;
    color: #888888;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

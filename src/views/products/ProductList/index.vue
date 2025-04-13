<template>
  <div class="product-list">
    <h2>商品列表</h2>

    <ProductSearchBar v-model:keyword="keyword" />

    <table>
      <thead>
        <tr>
          <th>商品名稱</th>
          <th>描述</th>
          <th>價格</th>
          <th>庫存</th>
          <th>分類</th>
          <th>狀態</th>
          <th>標籤</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in filteredProducts" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.description || "-" }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.category_id }}</td>
          <td>
            <span :class="product.is_active ? 'on' : 'off'">
              {{ product.is_active ? "上架中" : "已下架" }}
            </span>
          </td>
          <td>
            <span v-if="product.tags?.length">
              <span class="tag" v-for="tag in product.tags" :key="tag.id">
                {{ tag.name }}
              </span>
            </span>
            <span v-else>-</span>
          </td>
          <td>
            <RouterLink :to="`/products/${product.id}/manage`">編輯</RouterLink>
            |
            <RouterLink :to="`/products/${product.id}/images`">圖片</RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import ProductSearchBar from "@/views/products/ProductList/components/ProductSearchBar.vue";

const products = ref<any[]>([]);
const keyword = ref("");

const filteredProducts = computed(() => {
  if (!keyword.value.trim()) return products.value;
  const kw = keyword.value.toLowerCase();
  return products.value.filter((p) => {
    const tagText = p.tags?.map((t: any) => t.name).join(" ") ?? "";
    return [p.name, p.description, String(p.category_id), tagText]
      .join(" ")
      .toLowerCase()
      .includes(kw);
  });
});

onMounted(async () => {
  try {
    const res = await axios.get("http://127.0.0.1:3007/products/");
    const data = res.data.data;

    // 查標籤
    const tagResults = await Promise.allSettled(
      data.map((p: any) =>
        axios.get(`http://127.0.0.1:3007/api/products/${p.id}/tags`)
      )
    );

    data.forEach((p: any, i: number) => {
      const tagRes = tagResults[i];
      p.tags =
        tagRes.status === "fulfilled" && tagRes.value.data.code === 0
          ? tagRes.value.data.data
          : [];
    });

    products.value = data;
  } catch (err) {
    console.error("商品載入失敗", err);
  }
});
</script>

<style scoped lang="scss">
.product-list {
  h2 {
    margin-bottom: 16px;
  }

  .tag {
    display: inline-block;
    background: #e0f4f4;
    color: #289;
    font-size: 12px;
    padding: 4px 8px;
    margin: 2px;
    border-radius: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 12px;
      border: 1px solid #ccc;
      text-align: left;
    }

    .on {
      color: green;
    }

    .off {
      color: red;
    }

    a {
      color: #2cbfae;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

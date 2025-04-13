<template>
  <div class="product-list">
    <div class="title">
      <div class="titleName">商品列表</div>
      <div class="Diversion">
        <span>添加產品</span>
        <span>產品分類</span>
        <span>產品標籤</span>
      </div>
    </div>

    <div class="line"></div>

    <div class="elementInputArea">
      <div class="date-range-container">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="～"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          unlink-panels
          :clearable="true"
          class="date-picker"
        />
      </div>
      <el-select v-model="value" placeholder="分類" style="width: 240px">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input-tag
        v-model="input"
        draggable
        :clearable="true"
        placeholder="enter輸入標籤、最多三個"
        aria-label="Please click the Enter key after input"
        :max="3"
      />
      <el-input
        v-model="input"
        style="width: 240px"
        placeholder="請輸入產品名稱"
      />
      <el-button :icon="Search">Search</el-button>
    </div>
    <!-- <ProductSearchBar v-model:keyword="keyword" /> -->

    <div class="listArea">
      <table>
        <thead>
          <tr>
            <th>縮圖</th>
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
          <tr
            v-for="(product, index) in filteredProducts"
            :key="product.id"
            :class="index % 2 === 1 ? 'gray' : ''"
          >
            <td>這邊要放圖片</td>
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
              <RouterLink :to="`/products/${product.id}/manage`"
                >編輯</RouterLink
              >
              |
              <RouterLink :to="`/products/${product.id}/images`"
                >圖片</RouterLink
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import ProductSearchBar from "@/views/products/ProductList/components/ProductSearchBar.vue";
import { Search } from "@element-plus/icons-vue";
// ---
const dateRange = ref<[string, string]>(["", ""]); // 雙日期：陣列 [start, end]
const input = ref<string[]>(); //這是標籤輸入框
const value = ref("");
const options = [
  //假資料
  {
    value: "Option1",
    label: "Option1",
  },
  {
    value: "Option2",
    label: "Option2",
    disabled: true,
  },
  {
    value: "Option3",
    label: "Option3",
  },
  {
    value: "Option4",
    label: "Option4",
  },
  {
    value: "Option5",
    label: "Option5",
  },
];
// ---
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
  .title {
    display: flex;
    width: 100%;
    align-items: center;

    .titleName {
      width: 100%;
      font-size: 28px;
      font-weight: 500;
      position: relative;
      color: $primary-b-d;

      &::before {
        content: "";
        position: absolute;

        left: -12px;
        top: 0;
        width: 5px;
        height: 60%;
        transform: translateY(45%);
        background-color: $primary-y;
        align-items: center;
        border-radius: 2px;
      }
    }

    .Diversion {
      width: 100%;
      font-size: 16px;
      display: flex;
      justify-content: end;
      gap: 24px;

      span {
        border-radius: 16px;
        line-height: 1.5;
        padding: 6px 12px;
        cursor: pointer;
        border: 2px solid $primary-b-d;
        color: $primary-b-d;
        font-weight: 500;
      }

      span:nth-of-type(1) {
        background: $primary-b-d;
        color: $bg-1;
      }
    }
  }
  .line {
    width: 100%;
    height: 1px;
    margin-top: 16px;
    background-color: $text-ll;
  }
  .elementInputArea {
    display: flex;
    margin-top: 16px;
    gap: 16px;
    .date-range-container {
      :deep(.el-date-editor) {
        border-radius: 8px;
        width: 300px;

        .el-input__wrapper {
          border-radius: 8px;
        }
        // 範圍分隔符需要更精確定位
        .el-range-separator {
          color: $primary-b-d;
        }
        // 圖標顏色
        .el-input__icon {
          color: $primary-b-d;
        }
      }
    }
    :deep(.el-input-tag) {
      border-radius: 8px !important;
      width: 240px;
    }
  }
  .listArea {
    background-color: $bg-1;
    padding: 16px;
    margin-top: 16px;
    border-radius: 8px;

    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid black;
      border-radius: 8px;
      overflow: hidden;
      color: $text-d;

      thead {
        background-color: $primary-b-ll;
      }
      .gray {
        background-color: $bg-3;
      }
      th,
      td {
        padding: 0px 20px;
        text-align: left;
      }
      tr {
        height: 52px;
      }
      .on {
        color: $active-g;
      }
      .off {
        color: $active-r;
      }
      a {
        color: #2cbfae;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
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
    }
  }
}
//放裡面不生效 這是分類input
.elementInputArea .el-select :deep(.el-select__wrapper) {
  border-radius: 8px;
}
:deep(.el-input .el-input__wrapper) {
  // 選取 el-input 內的 el-input__wrapper
  border-radius: 8px; // 設定圓角，加上 !important 提高權重
  // 如果只想改特定的 el-input，可以給它加一個 class，例如 <el-input class="product-name-input">
  // 然後用 :deep(.product-name-input .el-input__wrapper)
  height: 32px;
}
:deep(.el-button) {
  border-radius: 8px;
  background-color: $primary-y-l;
  color: $text-d;
  &:active {
    border: 1px solid $primary-b-d;
  }
}
</style>

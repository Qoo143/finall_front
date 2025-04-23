<template>
  <div class="product-list">
    <div class="title">
      <div class="titleName">商品列表</div>
      <div class="Diversion">
        <RouterLink to="/products/manage">添加產品</RouterLink>
        <RouterLink to="/products/category">產品分類</RouterLink>
        <RouterLink to="/products/tag">產品標籤</RouterLink>
      </div>
    </div>

    <div class="line"></div>

    <div class="elementInputArea">
      <div class="date-range-container">
        <el-date-picker
          v-model="dateValue"
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
      <el-select v-model="catValue" placeholder="分類" style="width: 240px">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input-tag
        v-model="tagValue"
        draggable
        :clearable="true"
        placeholder="enter輸入標籤、最多三個"
        aria-label="Please click the Enter key after input"
        :max="3"
      />
      <el-select
        v-model="isActiveValue"
        placeholder="商品狀態"
        style="width: 120px"
      >
        <el-option label="上架中" :value="1" />
        <el-option label="已下架" :value="0" />
      </el-select>
      <el-input
        v-model="nameValue"
        style="width: 240px"
        placeholder="請輸入產品名稱"
      />
      <el-button :icon="Search" @click="handleSearch">Search</el-button>
      <el-button @click="handleReset" class="resetBtn">重設</el-button>
    </div>

    <div class="listArea">
      <table>
        <colgroup>
          <!-- 比數 -->
          <col style="width: 30px" />
          <!-- 名稱 -->
          <col style="width: 100px" />
          <!-- 縮圖 -->
          <col style="width: 100px" />
          <!-- 價格 -->
          <col style="width: 80px" />
          <!-- 庫存 -->
          <col style="width: 80px" />
          <!-- 分類 -->
          <col style="width: 50px" />
          <!-- 狀態 -->
          <col style="width: 80px" />
          <!-- 標籤 -->
          <col style="width: 160px" />
          <!-- 時間 -->
          <col style="width: 100px" />
          <!-- 操作 -->
          <col style="width: 80px" />
        </colgroup>
        <thead>
          <tr>
            <th>筆數</th>
            <th>商品名稱</th>
            <th>縮圖</th>
            <th>價格</th>
            <th>庫存</th>
            <th>分類</th>
            <th>狀態</th>
            <th>標籤</th>
            <th>創建時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(product, index) in products"
            :key="product.id"
            :class="{
              gray: index % 2 === 1,
              'hover-effect-d': index % 2 === 1,
              'hover-effect-l': index % 2 === 0,
            }"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ product.name }}</td>
            <td>
              <img
                v-if="product.main_image_url"
                :src="getImageUrl(product.main_image_url)"
                alt="主圖"
                style="
                  width: 80px;
                  height: 50px;
                  object-fit: contain;
                  border-radius: 8px;
                "
              />
              <div
                v-else
                style="
                  width: 80px;
                  height: 50px;
                  background-color: #f0f0f0;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                -
              </div>
            </td>
            <td>{{ `$${product.price.toLocaleString()}` }}</td>
            <td>{{ product.stock }}</td>
            <td>{{ getCategoryLabel(product.category_id) }}</td>
            <td>
              <span :class="product.is_active ? 'on' : 'off'">
                {{ product.is_active ? "上架中" : "已下架" }}
              </span>
            </td>
            <td :title="(product.tags || []).map((t:any) => t.name).join(', ')">
              <span v-if="product.tags?.length">
                <span class="tag" v-for="tag in product.tags" :key="tag.id">
                  {{ tag.name }}
                </span>
              </span>
              <span v-else>-</span>
            </td>
            <td :title="product.created_time">
              {{ formatDate(product.created_time) || "-" }}
            </td>

            <td>
              <span @click="openDetail(product)">查看</span>
              |
              <RouterLink :to="`/products/manage/${product.id}`"
                >編輯</RouterLink
              >
              |
              <span @click="openDelete(product.id, product.name)">刪除</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pageNation">
      <!-- hide-on-single-page -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="handlePageChange"
        background
      />
    </div>
    <DeleteConfirmModal
      v-if="deleteDialogVisible"
      v-model:visible="deleteDialogVisible"
      v-model:productId="selectedProductId"
      v-model:productName="selectedProductName"
      :on-deleted="fetchProducts"
    />
    <ProductDetailModal
      v-if="detailDialogVisible"
      v-model:visible="detailDialogVisible"
      v-model:product="selectedProduct"
      :on-deleted="fetchProducts"
    />
  </div>
  <!-- 這邊是彈窗 不包起來css會壞掉 -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { Search } from "@element-plus/icons-vue";
import ProductDetailModal from "@/views/products/ProductList/components/ProductDetailModal.vue";
import DeleteConfirmModal from "@/views/products/ProductList/components/DeleteConfirmModal.vue";
// 定義接口
interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  is_active: number;
  category_id: number;
  tags: Tag[];
}

// 條件綁定
const dateValue = ref<[string, string]>(["", ""]);
const catValue = ref(""); // 分類 ID
const tagValue = ref<string[]>([]); // 標籤（多個）
const isActiveValue = ref<number | "">("");
const nameValue = ref(""); // 名稱

// 分頁相關
const currentPage = ref(1); //目前所在頁面
const pageSize = ref(8); //一頁選染幾筆
const total = ref(0); //數據總頁數

// 分頁-變更處理
const handlePageChange = (val: number) => {
  currentPage.value = val;
  fetchProducts();
};

// 資料狀態
const products: any = ref<Product[]>([]);
const loading = ref(false);

//顯示照片邏輯
const getImageUrl = (relativePath: string) => {
  return `http://127.0.0.1:3007${relativePath}`;
};

// 分類選項
const options = ref<{ value: number; label: string }[]>([]);

//獲取分類列表
const fetchCategories = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:3007/categories");
    const raw = res.data.data || [];
    options.value = raw.map((c: any) => ({
      value: c.id,
      label: c.name,
    }));
  } catch (err) {
    console.error("分類查詢失敗", err);
  }
};

//獲取分類名稱(給頁面渲染)
const getCategoryLabel = (id: number) => {
  const found = options.value.find((o) => o.value === id);
  return found ? found.label : "-";
};

//轉換日期格式
function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toISOString().split("T")[0]; // => '2025-04-10'
}

// 查詢 API
const fetchProducts = async () => {
  try {
    loading.value = true;

    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    // 處理日期範圍 - 將兩個日期值分別作為獨立參數發送
    if (dateValue.value && dateValue.value[0] && dateValue.value[1]) {
      params["start_date"] = dateValue.value[0]; // 開始日期
      params["end_date"] = dateValue.value[1]; // 結束日期
    }

    // 處理分類
    if (catValue.value) {
      params["category_id"] = catValue.value;
    }

    // 處理標籤 - 支援多個標籤模糊查詢
    if (tagValue.value.length > 0) {
      // 使用 tags[] 格式傳遞多個標籤
      params["tags"] = tagValue.value;
    }

    // 處理商品名稱
    if (nameValue.value.trim()) {
      params["name"] = nameValue.value.trim();
    }

    // 處理商品狀態
    if (isActiveValue.value !== "") {
      params["is_active"] = isActiveValue.value;
    }

    // 發送請求
    const res = await axios.get("http://127.0.0.1:3007/products", {
      params,
      // 確保陣列參數正確傳遞
      paramsSerializer: (params) => {
        const urlParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // 對於陣列參數，使用 tags[]=tag1&tags[]=tag2 的格式
            value.forEach((item) => urlParams.append(`${key}[]`, item));
          } else {
            urlParams.append(key, value);
          }
        });

        return urlParams.toString();
      },
    });

    const rawData = res.data.data?.data || [];
    total.value = res.data.data?.total || 0;

    // 查詢每筆商品的標籤
    const tagResults = await Promise.allSettled(
      rawData.map((p: any) =>
        axios.get(`http://127.0.0.1:3007/api/products/${p.id}/tags`)
      )
    );

    rawData.forEach((p: any, i: any) => {
      const tagRes = tagResults[i];
      p.tags =
        tagRes.status === "fulfilled" && tagRes.value.data.code === 0
          ? tagRes.value.data.data
          : [];
    });

    products.value = rawData;
  } catch (err) {
    console.error("商品查詢失敗", err);
  } finally {
    loading.value = false;
  }
};

// 搜尋按鈕觸發
const handleSearch = () => {
  currentPage.value = 1; // 重置為第一頁
  fetchProducts();
};

// 重設按鈕觸發
const handleReset = () => {
  dateValue.value = ["", ""];
  catValue.value = "";
  tagValue.value = [];
  isActiveValue.value = "";
  nameValue.value = "";
  currentPage.value = 1;
  fetchProducts();
};
//查看按鈕邏輯
const detailDialogVisible = ref(false);
const selectedProduct = ref<Product | null>(null);

const openDetail = (product: Product) => {
  selectedProduct.value = product;
  detailDialogVisible.value = true;
};
//刪除按鈕邏輯
const deleteDialogVisible = ref(false);
const selectedProductId = ref<number | undefined>(undefined);
const selectedProductName = ref<string>("");

const openDelete = (id: number, name: string) => {
  selectedProductId.value = id;
  selectedProductName.value = name;
  deleteDialogVisible.value = true;
};

// 初始載入
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped lang="scss">
@import "@/assets/css/common.scss";

.product-list {
  .title {
    display: flex;
    width: 100%;
    align-items: center;

    .titleName {
      width: 200px;
      font-size: 32px;
      font-weight: 600;
      position: relative;
      color: $primary-b-d;

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
    }

    .Diversion {
      width: 100%;
      font-size: 16px;
      display: flex;
      // justify-content: end;
      gap: 24px;

      a {
        border-radius: 16px;
        line-height: 1.5;
        padding: 6px 12px;
        cursor: pointer;
        color: $primary-b-d;
        font-weight: 500;
        text-decoration: none;
        border: 1px solid $primary-b-d;
        &:hover {
          background: $primary-b;
          color: $bg-2;
          border: 1px solid $primary-b-d;
        }
      }

      a:nth-of-type(1) {
        background: $primary-b-d;
        color: $bg-1;
        &:hover {
          background: $primary-b-l;
          color: $primary-b-d;
        }
      }
    }
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
      .resetBtn {
        margin-left: 0px;
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
      thead tr {
        height: 40px;
      }
      th,
      td {
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      td:first-child,
      th:first-child {
        padding-left: 24px;
      }

      tbody tr {
        height: 64px;
      }

      .hover-effect-l:hover {
        background-color: #e0e0e0;
        transition: background-color 0.2s ease;
      }

      .hover-effect-d:hover {
        background-color: #c5c5c5;
        transition: background-color 0.2s ease;
      }

      a,
      td:last-child span {
        color: $primary-b-d;
        text-decoration: none;
        background-color: $primary-b-ll;
        padding: 4px 8px;
        border-radius: 5px;
        cursor: pointer;
        margin: 0 5px;
        &:hover {
          background-color: $primary-b;
          color: $bg-3;
        }
      }
      .tag {
        display: inline-block;
        background: $primary-b-ll;
        color: $primary-b-d;
        font-size: 12px;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 6px;
      }
    }
  }
}
.pageNation {
  width: 100%;
  display: flex;
  justify-content: end;
  margin-top: 12px;
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
:deep(.resetBtn.el-button) {
  background-color: $primary-b-l !important;
  margin-left: 5px;
}
</style>

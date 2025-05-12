<!-- src/views/home/ProductsPage/index.vue -->
<template>
  <div class="wrapper">
    <div class="products-page">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1>商品瀏覽</h1>
        <p>發現最新、最熱門的商品</p>
      </div>

      <!-- 篩選區域 -->
      <div class="filter-section">
        <div class="filter-container">
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
          <el-select v-model="catValue" placeholder="分類" style="width: 180px">
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
            placeholder="輸入標籤 (最多三個)"
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
            style="width: 200px"
            placeholder="請輸入產品名稱"
          />
          <div class="button-group">
            <el-button :icon="Search" @click="handleSearch" class="search-btn"
              >搜尋</el-button
            >
            <el-button @click="handleReset" class="reset-btn">重設</el-button>
          </div>
        </div>
      </div>

      <!-- 商品網格 -->
      <div v-if="!loading" class="products-grid">
        <template v-if="products.length > 0">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @view="openProductDetail"
          />
        </template>
        <div v-else class="no-products">
          <el-empty description="沒有符合條件的商品" />
        </div>
      </div>

      <!-- 載入中效果 -->
      <div v-else class="loading-container">
        <el-skeleton :rows="4" animated />
      </div>

      <!-- 分頁控制 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @current-change="handlePageChange"
          background
        />
      </div>

      <!-- 商品詳情彈窗 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="商品詳情"
        width="80%"
        top="5vh"
        destroy-on-close
      >
        <div v-if="selectedProduct" class="product-detail">
          <div class="detail-image">
            <img
              :src="
                selectedProduct.main_image_url
                  ? `http://127.0.0.1:3007${selectedProduct.main_image_url}`
                  : '/img/placeholder.png'
              "
              :alt="selectedProduct.name"
            />
          </div>
          <div class="detail-info">
            <h2>{{ selectedProduct.name }}</h2>
            <div class="price">${{ selectedProduct.price }}</div>
            <div class="stock">庫存: {{ selectedProduct.stock }}</div>
            <div class="tags">
              <span
                v-for="tag in selectedProduct.tags"
                :key="tag.id"
                class="tag"
              >
                {{ tag.name }}
              </span>
            </div>
            <div class="description">
              <h3>商品描述</h3>
              <p>{{ selectedProduct.description || "暫無描述" }}</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Search } from "@element-plus/icons-vue";
import ProductCard from "./components/ProductCard.vue";

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
  main_image_url: string;
  tags: Tag[];
}

// 條件綁定
const dateValue = ref<[string, string]>(["", ""]);
const catValue = ref(""); // 分類 ID
const tagValue = ref<string[]>([]); // 標籤（多個）
const isActiveValue = ref<number | "">("");
const nameValue = ref(""); // 名稱

// 分頁相關
const currentPage = ref(1);
const pageSize = ref(8);
const total = ref(0);

// 資料狀態
const products = ref<Product[]>([]);
const loading = ref(false);
const options = ref<{ value: number; label: string }[]>([]);

// 商品詳情彈窗
const detailDialogVisible = ref(false);
const selectedProduct = ref<Product | null>(null);

// 查詢商品函數
const fetchProducts = async () => {
  try {
    loading.value = true;

    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    // 處理日期範圍
    if (dateValue.value && dateValue.value[0] && dateValue.value[1]) {
      params["start_date"] = dateValue.value[0];
      params["end_date"] = dateValue.value[1];
    }

    // 處理分類
    if (catValue.value) {
      params["category_id"] = catValue.value;
    }

    // 處理標籤
    if (tagValue.value.length > 0) {
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
      paramsSerializer: (params) => {
        const urlParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
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

// 獲取分類列表
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

// 分頁函數
const handlePageChange = (val: number) => {
  currentPage.value = val;
  fetchProducts();
};

// 搜尋函數
const handleSearch = () => {
  currentPage.value = 1;
  fetchProducts();
};

// 重設函數
const handleReset = () => {
  dateValue.value = ["", ""];
  catValue.value = "";
  tagValue.value = [];
  isActiveValue.value = "";
  nameValue.value = "";
  currentPage.value = 1;
  fetchProducts();
};

// 開啟商品詳情
const openProductDetail = (product: Product) => {
  selectedProduct.value = product;
  detailDialogVisible.value = true;
};

// 初始載入
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped lang="scss">
.wrapper {
  .products-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;

    .page-header {
      text-align: center;
      margin-top: 3rem;
      margin-bottom: 32px;

      h1 {
        font-size: 32px;
        font-weight: 700;
        color: $primary-b-d;
        margin-bottom: 8px;
      }

      p {
        font-size: 16px;
        color: $text-d;
      }
    }

    .filter-section {
      background-color: $bg-3;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

      .filter-container {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .button-group {
          display: flex;
          gap: 8px;
        }

        .search-btn {
          background-color: $primary-b-d;
          color: white;
          border: none;

          &:hover {
            background-color: $primary-b;
          }
        }

        .reset-btn {
          background-color: $primary-b-l;
          color: $text-d;
          border: none;

          &:hover {
            background-color: $primary-b-ll;
          }
        }
      }

      .date-range-container {
        :deep(.el-date-editor) {
          border-radius: 8px;
          width: 300px;

          .el-input__wrapper {
            border-radius: 8px;
          }

          .el-range-separator {
            color: $primary-b-d;
          }

          .el-input__icon {
            color: $primary-b-d;
          }
        }
      }

      :deep(.el-input-tag) {
        border-radius: 8px !important;
        width: 240px;
      }

      :deep(.el-input .el-input__wrapper) {
        border-radius: 8px;
        height: 40px;
      }

      :deep(.el-button) {
        border-radius: 8px;
        height: 40px;
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-bottom: 40px;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }

      .no-products {
        grid-column: 1 / -1;
        padding: 40px 0;
      }
    }

    .loading-container {
      padding: 40px 0;
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }
  }
}
// 商品詳情彈窗樣式
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    background-color: $primary-b-d;
    color: white;
    padding: 16px 20px;

    .el-dialog__title {
      color: white;
      font-weight: 600;
    }
  }
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .detail-image {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .detail-info {
    h2 {
      font-size: 28px;
      font-weight: 700;
      color: $primary-b-d;
      margin-bottom: 16px;
    }

    .price {
      font-size: 32px;
      font-weight: 700;
      color: $primary-y;
      margin-bottom: 16px;
    }

    .stock {
      font-size: 18px;
      color: $text-d;
      margin-bottom: 16px;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;

      .tag {
        background-color: $primary-b-ll;
        color: $primary-b-d;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 14px;
      }
    }

    .description {
      background-color: $bg-1;
      padding: 16px;
      border-radius: 12px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: $primary-b-d;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
        line-height: 1.6;
        color: $text-d;
      }
    }
  }
}
</style>

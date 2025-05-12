<template>
  <div class="wrapper">
    <div class="products-container">
      <!-- 左側篩選區 -->
      <div class="filter-sidebar">
        <div class="sidebar-section">
          <h2>商品搜尋</h2>
          <el-input
            v-model="nameValue"
            placeholder="輸入商品名稱"
            class="search-input"
            prefix-icon="Search"
          />
        </div>

        <div class="sidebar-section">
          <h2>商品分類</h2>
          <el-select
            v-model="catValue"
            placeholder="選擇分類"
            class="sidebar-select"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="sidebar-section">
          <h2>商品標籤</h2>
          <el-input-tag
            v-model="tagValue"
            draggable
            :clearable="true"
            placeholder="輸入標籤 (最多三個)"
            aria-label="按 Enter 確認輸入"
            :max="3"
            class="sidebar-input-tag"
          />
        </div>

        <!-- 上架時間 - 垂直布局 -->
        <div class="sidebar-section">
          <h2>上架時間</h2>
          <div class="date-inputs-vertical">
            <el-date-picker
              v-model="startDate"
              type="date"
              placeholder="開始日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              class="sidebar-date-picker"
            />
            <el-date-picker
              v-model="endDate"
              type="date"
              placeholder="結束日期"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              class="sidebar-date-picker"
            />
          </div>
        </div>

        <div class="sidebar-actions">
          <el-button
            @click="handleSearch"
            type="primary"
            class="search-btn"
            :icon="Search"
          >
            搜尋
          </el-button>
          <el-button @click="handleReset" class="reset-btn">
            重設條件
          </el-button>
        </div>
      </div>

      <!-- 右側商品區 -->
      <div class="products-main">
        <div class="page-header">
          <h1>商品瀏覽</h1>
          <div class="sort-container">
            <span class="sort-label">排序方式: </span>
            <el-select 
              v-model="sortValue" 
              placeholder="排序" 
              size="small"
              class="sort-select"
            >
              <el-option label="最新上架" value="newest" />
              <el-option label="價格由低到高" value="price_asc" />
              <el-option label="價格由高到低" value="price_desc" />
            </el-select>
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
              @add-to-cart="handleAddToCart"
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
      </div>
    </div>

    <!-- 商品詳情彈窗 -->
    <ProductDetailModal
      v-if="detailDialogVisible"
      v-model:visible="detailDialogVisible"
      :product="selectedProduct"
      @add-to-cart="handleAddToCart"
    />

    <!-- 數量選擇彈窗 -->
    <QuantitySelector
      v-if="quantityDialogVisible"
      v-model:visible="quantityDialogVisible"
      :product="selectedCartProduct"
      @confirm="addToCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ProductCard from "./components/ProductCard.vue";
import ProductDetailModal from "./components/ProductDetailModal.vue";
import QuantitySelector from "./components/QuantitySelector.vue";

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

// 日期選擇 - 分開為兩個日期
const startDate = ref("");
const endDate = ref("");
// 計算得出原本的 dateValue 格式
const dateValue = computed(() => [startDate.value, endDate.value]);

// 條件綁定
const catValue = ref(""); // 分類 ID
const tagValue = ref<string[]>([]); // 標籤（多個）
const nameValue = ref(""); // 名稱
const sortValue = ref("newest"); // 預設最新上架

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

// 購物車相關
const quantityDialogVisible = ref(false);
const selectedCartProduct = ref<Product | null>(null);
const quantity = ref(1);

// 查詢商品函數
const fetchProducts = async () => {
  try {
    loading.value = true;

    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      is_frontend: "true", // 標識為前台請求
    };

    // 處理日期範圍 - 使用計算得出的 dateValue
    if (dateValue.value[0] && dateValue.value[1]) {
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

    // 處理排序
    if (sortValue.value) {
      params["sort"] = sortValue.value;
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
  startDate.value = "";
  endDate.value = "";
  catValue.value = "";
  tagValue.value = [];
  nameValue.value = "";
  sortValue.value = "newest";
  currentPage.value = 1;
  fetchProducts();
};

// 開啟商品詳情
const openProductDetail = (product: Product) => {
  selectedProduct.value = product;
  detailDialogVisible.value = true;
};

// 處理加入購物車
const handleAddToCart = (product: Product) => {
  selectedCartProduct.value = product;
  quantityDialogVisible.value = true;

  // 如果商品詳情彈窗正在顯示，則關閉它
  if (detailDialogVisible.value) {
    detailDialogVisible.value = false;
  }
};

// 添加到購物車
const addToCart = (quantity: number) => {
  if (!selectedCartProduct.value) return;

  // 將來在這裡添加 API 調用
  ElMessage.success(
    `已將 ${quantity} 件 ${selectedCartProduct.value.name} 加入購物車`
  );
  quantityDialogVisible.value = false;
};

// 初始載入
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #f9f9f9;
}

.products-container {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 8vh 0px 40px;
  gap: 30px;
}

/* 左側篩選欄 */
.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  align-self: flex-start;
  position: sticky;
  top: 80px;
  height: 80vh;

  .sidebar-section {
    margin-bottom: 24px;

    h2 {
      font-size: 16px;
      font-weight: 600;
      color: $primary-b-d;
      margin-bottom: 12px;
    }

    .search-input,
    .sidebar-select,
    .sidebar-input-tag,
    .sidebar-date-picker {
      width: 100%;
    }
  }

  /* 添加新的垂直布局樣式 */
  .date-inputs-vertical {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .sidebar-date-picker {
      width: 100%;
    }
  }

  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 32px;

    .search-btn,
    .reset-btn {
      width: 100%;
      height: 40px;
      margin: 0; /* 清除所有邊距 */
    }

    .search-btn {
      background-color: $primary-b-d;
      border: none;
      margin-bottom: 10px;

      &:hover {
        background-color: $primary-b;
      }
    }

    .reset-btn {
      background-color: $bg-3;
      color: $text-d;
      border: none;
      margin-left: 0 !important; /* 確保覆蓋 Element Plus 的樣式 */

      &:hover {
        background-color: $primary-b-ll;
      }
    }
  }
}

/* 右側主內容區 */
.products-main {
  flex: 1;
  min-width: 0; // 避免彈性項目超出容器

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: nowrap; /* 防止在小螢幕上換行 */

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: $primary-b-d;
      margin-right: 20px; /* 確保標題與排序區域有間距 */
      white-space: nowrap; /* 防止標題折疊 */
    }

    .sort-container {
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 10px;
      min-width: 280px; /* 給予足夠寬度 */
      white-space: nowrap; /* 防止文字折疊 */

      .sort-label {
        color: $text-d;
        font-size: 14px;
        flex-shrink: 0; /* 防止文字壓縮 */
      }

      .sort-select {
        min-width: 140px; /* 給選擇器足夠寬度 */
        width: auto;
      }
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, auto); // 明確指定兩行
    gap: 24px;
    margin-bottom: 2rem;

    @media (max-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 576px) {
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
    justify-content: end;
    margin-top: 32px;
  }
}

/* Element Plus 樣式覆蓋 */
:deep(.el-input .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-input-tag) {
  border-radius: 8px !important;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}

:deep(.el-date-editor.el-input .el-input__wrapper) {
  padding: 0 12px;
}

:deep(.el-select .el-input) {
  width: 100%;
}

:deep(.el-button) {
  border-radius: 8px;
}

/* 修復排序選擇器寬度和文字顯示問題 */
:deep(.sort-select) {
  .el-input {
    width: 100%; 
    min-width: 140px;
  }
  
  .el-input__wrapper {
    width: 100%;
  }
}

/* 確保下拉選單有足夠寬度 */
:deep(.el-select-dropdown) {
  min-width: 160px !important;
}

:deep(.el-select-dropdown__item) {
  white-space: nowrap;
  min-width: 140px;
}

/* 媒體查詢，在更小的屏幕上調整排序區域 */
@media (max-width: 768px) {
  .products-main .page-header {
    flex-direction: column;
    align-items: flex-start;
    
    h1 {
      margin-bottom: 16px;
    }
    
    .sort-container {
      width: 100%;
      justify-content: flex-start;
    }
  }
}
</style>
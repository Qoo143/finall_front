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
              v-for="item in categories"
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
            :loading="isLoading"
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
        </div>

        <!-- 商品網格 -->
        <div v-if="!isLoading" class="products-grid">
          <template v-if="products.length > 0">
            <ProductCard
              v-for="(product, index) in products"
              :key="product.id"
              v-model:product="products[index]"
              v-model:isLoading="isLoading"
              v-model:selectedProduct="selectedProduct"
              @addToCart="openQuantitySelector"
              @viewDetails="openProductDetail"
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
      v-model:visible="detailDialogVisible"
      v-model:product="selectedProduct"
      v-model:isLoading="isLoading"
      @addToCart="openQuantitySelector"
    />

    <!-- 數量選擇彈窗 -->
    <QuantitySelector
      v-model:visible="quantityDialogVisible"
      v-model:product="selectedCartProduct"
      v-model:isLoading="isLoading"
      v-model:quantity="selectedQuantity"
      @confirm="addToCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ProductCard from "./components/ProductCard.vue";
import ProductDetailModal from "./components/ProductDetailModal.vue";
import QuantitySelector from "./components/QuantitySelector.vue";

// 導入 API 和 Store
import { useCartStore } from "@/stores/cart";
import { useUserInfoStore } from "@/stores/user";
import { addToCart as apiAddToCart } from "@/api/cart";

const cartStore = useCartStore();
const userStore = useUserInfoStore();

// 定義接口
interface Tag {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_active?: number;
  category_id?: number;
  main_image_url: string;
  tags?: Tag[];
}

// 篩選條件状态
const nameValue = ref("");
const catValue = ref("");
const tagValue = ref<string[]>([]);
const startDate = ref("");
const endDate = ref("");

// 分頁相關
const currentPage = ref(1);
const pageSize = ref(8);
const total = ref(0);

// 商品数据
const products = ref<Product[]>([]);
const categories = ref<{ value: number; label: string }[]>([]);
const isLoading = ref(false);

// 模態框相關
const detailDialogVisible = ref(false);
const selectedProduct = ref<Product | null>(null);
const quantityDialogVisible = ref(false);
const selectedCartProduct = ref<Product | null>(null);
const selectedQuantity = ref(1);

/**
 * 日期計算屬性 - 用於API請求
 */
const dateValue = computed(() => {
  if (startDate.value && endDate.value) {
    return [startDate.value, endDate.value];
  }
  return ["", ""];
});

/**
 * 查詢商品函數 - 使用後端 API 獲取商品列表
 */
const fetchProducts = async () => {
  try {
    isLoading.value = true;

    // 構建查詢參數
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      is_frontend: "true", // 標識為前台請求，只顯示上架商品
    };

    // 處理日期範圍
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

    // 解析回應數據
    const rawData = res.data.data?.data || [];
    total.value = res.data.data?.total || 0;

    // 查詢每筆商品的標籤
    const tagResults = await Promise.allSettled(
      rawData.map((p: any) =>
        axios.get(`http://127.0.0.1:3007/api/products/${p.id}/tags`)
      )
    );

    // 將標籤數據添加到商品對象
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
    ElMessage.error("商品資料載入失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

/**
 * 獲取分類列表
 */
const fetchCategories = async () => {
  try {
    const res = await axios.get("http://127.0.0.1:3007/categories");
    const raw = res.data.data || [];
    categories.value = raw.map((c: any) => ({
      value: c.id,
      label: c.name,
    }));
  } catch (err) {
    console.error("分類查詢失敗", err);
    ElMessage.error("分類資料載入失敗");
  }
};

/**
 * 分頁切換處理函數
 */
const handlePageChange = (val: number) => {
  currentPage.value = val;
  fetchProducts();
};

/**
 * 搜尋按鈕處理函數
 */
const handleSearch = () => {
  currentPage.value = 1; // 重置為第一頁
  fetchProducts();
};

/**
 * 重設按鈕處理函數
 */
const handleReset = () => {
  startDate.value = "";
  endDate.value = "";
  catValue.value = "";
  tagValue.value = [];
  nameValue.value = "";
  currentPage.value = 1;
  fetchProducts();
};

// 開啟商品詳情彈窗並獲取完整商品信息
const openProductDetail = async (product: Product) => {
  try {
    selectedProduct.value = product; // 先設置基本信息
    detailDialogVisible.value = true; // 顯示對話框
    isLoading.value = true; // 設置加載狀態
    
    // 請求詳細商品信息
    const { data } = await axios.get(`http://127.0.0.1:3007/products/${product.id}`);
    
    if (data && data.code === 0) {
      // 成功獲取完整信息後更新選中商品
      selectedProduct.value = data.data;
    }
  } catch (error) {
    console.error("獲取商品詳情失敗", error);
    ElMessage.error("獲取商品詳情失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};

/**
 * 開啟數量選擇彈窗
 */
const openQuantitySelector = (product: Product) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入後再加入購物車");
    return;
  }

  selectedCartProduct.value = product;
  quantityDialogVisible.value = true;

  // 如果商品詳情彈窗正在顯示，則關閉它
  if (detailDialogVisible.value) {
    detailDialogVisible.value = false;
  }
};

/**
 * 加入購物車
 */
const addToCart = async (quantity: number) => {
  if (!selectedCartProduct.value) return;

  try {
    isLoading.value = true;

    // 將商品的庫存信息一併傳入
    const result: any = await cartStore.addToCart(
      {
        id: selectedCartProduct.value.id,
        name: selectedCartProduct.value.name,
        price: selectedCartProduct.value.price,
        image_url: selectedCartProduct.value.main_image_url,
        stock: selectedCartProduct.value.stock, // 添加庫存信息
      },
      quantity
    );

    // 只有在成功加入購物車時才關閉對話框
    if (result) {
      quantityDialogVisible.value = false;
    }
  } catch (error) {
    console.error("加入購物車失敗:", error);
    ElMessage.error("加入購物車失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
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
  height: 100%;
  background-color: #f9f9f9;
}

.products-container {
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  padding: 8vh 0px 0px 16px;
  gap: 2rem;
  background-color: #f9f9f9;
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

  /* 垂直布局樣式 */
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
      margin: 0;
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
      margin-left: 0 !important;

      &:hover {
        background-color: $primary-b-ll;
      }
    }
  }
}

/* 右側主內容區 */
.products-main {
  flex: 1;
  min-width: 0;
  padding-right: 1rem;
  //添加該區域之滾動軸
  max-height: calc(100vh - 8vh); // 設定最大高度
  overflow-y: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: nowrap;

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: $primary-b-d;
      margin-right: 20px;
      white-space: nowrap;
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, auto);
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

/* 排序選擇器樣式修復 */
:deep(.sort-select) {
  .el-input {
    width: 100%;
    min-width: 140px;
  }

  .el-input__wrapper {
    width: 100%;
  }
}

:deep(.el-select-dropdown) {
  min-width: 160px !important;
}

:deep(.el-select-dropdown__item) {
  white-space: nowrap;
  min-width: 140px;
}

/* 媒體查詢適配 */
@media (max-width: 768px) {
  .filter-sidebar {
    width: 200px;
  }
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

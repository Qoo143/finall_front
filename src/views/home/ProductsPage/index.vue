<!-- src/views/home/ProductsPage/index.vue -->
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

        <div class="sidebar-section">
          <h2>上架時間</h2>
          <el-date-picker
            v-model="dateValue"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            unlink-panels
            :clearable="true"
            class="sidebar-date-picker"
          />
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
          <el-button 
            @click="handleReset" 
            class="reset-btn"
          >
            重設條件
          </el-button>
        </div>
      </div>

      <!-- 右側商品區 -->
      <div class="products-main">
        <div class="page-header">
          <h1>商品瀏覽</h1>
          <div class="sort-container">
            <span>排序方式: </span>
            <el-select v-model="sortValue" placeholder="排序" size="small">
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
          <div class="actions">
            <el-button type="primary" size="large" @click="handleAddToCart(selectedProduct)">加入購物車</el-button>
            <el-button size="large">收藏商品</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 數量選擇彈窗 -->
    <el-dialog
      v-model="quantityDialogVisible"
      title="選擇數量"
      width="320px"
      center
      :show-close="true"
      custom-class="quantity-dialog"
    >
      <div class="quantity-selector" v-if="selectedCartProduct">
        <img
          :src="getProductImageUrl(selectedCartProduct)"
          :alt="selectedCartProduct.name"
          class="product-thumbnail"
        />
        <div class="product-info-mini">
          <div class="product-name">{{ selectedCartProduct.name }}</div>
          <div class="product-price">${{ selectedCartProduct.price }}</div>
        </div>
        <div class="quantity-control">
          <span class="label">數量:</span>
          <el-input-number 
            v-model="quantity" 
            :min="1" 
            :max="selectedCartProduct.stock || 99"
            size="small"
          />
        </div>
        <div class="quantity-actions">
          <el-button @click="quantityDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addToCart">確認</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
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

    // 處理排序
    if (sortValue.value) {
      // 伺服器端需要支援此參數
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
  dateValue.value = ["", ""];
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
  quantity.value = 1;
  quantityDialogVisible.value = true;
  
  // 如果商品詳情彈窗正在顯示，則關閉它
  if (detailDialogVisible.value) {
    detailDialogVisible.value = false;
  }
};

// 獲取商品圖片 URL
const getProductImageUrl = (product: Product) => {
  if (!product.main_image_url) return '/img/placeholder.png';
  return `http://127.0.0.1:3007${product.main_image_url}`;
};

// 添加到購物車
const addToCart = () => {
  if (!selectedCartProduct.value) return;
  
  // 將來在這裡添加 API 調用
  ElMessage.success(
    `已將 ${quantity.value} 件 ${selectedCartProduct.value.name} 加入購物車`
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
  padding: 80px 20px 40px;
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
  
  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 32px;
    
    .search-btn,
    .reset-btn {
      width: 100%;
      height: 40px;
    }
    
    .search-btn {
      background-color: $primary-b-d;
      border: none;
      
      &:hover {
        background-color: $primary-b;
      }
    }
    
    .reset-btn {
      background-color: $bg-3;
      color: $text-d;
      border: none;
      
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
    
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: $primary-b-d;
    }
    
    .sort-container {
      display: flex;
      align-items: center;
      gap: 10px;
      
      span {
        color: $text-d;
        font-size: 14px;
      }
    }
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, auto); // 明確指定兩行
    gap: 24px;
    margin-bottom: 40px;

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
    justify-content: center;
    margin-top: 32px;
  }
}

/* 商品詳情彈窗樣式 */
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
      margin-bottom: 24px;

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
    
    .actions {
      display: flex;
      gap: 16px;
      
      .el-button {
        flex: 1;
      }
    }
  }
}

/* 數量選擇彈窗樣式 */
:deep(.quantity-dialog) {
  .el-dialog__header {
    padding: 16px;
    margin-right: 0;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .el-dialog__body {
    padding: 20px;
  }
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .product-thumbnail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  
  .product-info-mini {
    margin-bottom: 20px;
    text-align: center;
    
    .product-name {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    .product-price {
      color: $primary-y;
      font-weight: 700;
      font-size: 18px;
    }
  }
  
  .quantity-control {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    
    .label {
      margin-right: 16px;
      font-size: 16px;
    }
  }
  
  .quantity-actions {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
    
    .el-button {
      flex: 1;
    }
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
</style>
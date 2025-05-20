<template>
  <div class="order-list-page">
    <h1 class="page-title">我的訂單</h1>

    <!-- 訂單篩選區域 -->
    <div class="filter-section">
      <div class="filter-controls">
        <el-select v-model="filterStatus" placeholder="訂單狀態" clearable>
          <el-option label="全部訂單" :value="null" />
          <el-option label="待處理" :value="0" />
          <el-option label="已發貨" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          :clearable="true"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
        />

        <el-button
          type="primary"
          @click="fetchOrders"
          :icon="Search"
          :loading="isLoading"
        >
          搜尋
        </el-button>

        <el-button @click="resetFilters" :icon="RefreshRight"> 重設 </el-button>
      </div>
    </div>

    <!-- 訂單列表 -->
    <div class="orders-container">
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <template v-else-if="orders.length > 0">
        <el-table
          :data="orders"
          stripe
          style="width: 100%"
          :header-cell-style="{ backgroundColor: '#f9f9f9' }"
          class="order-table"
        >
          <el-table-column label="訂單編號" min-width="180">
            <template #default="scope">
              <span class="order-number">{{ scope.row.order_number }}</span>
            </template>
          </el-table-column>

          <el-table-column label="訂單日期" min-width="160">
            <template #default="scope">
              {{ formatDate(scope.row.created_time) }}
            </template>
          </el-table-column>

          <el-table-column label="訂單狀態" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="訂單金額" width="140">
            <template #default="scope">
              <span class="order-amount"
                >${{ scope.row.total_amount.toLocaleString() }}</span
              >
            </template>
          </el-table-column>

          <el-table-column label="收件人" min-width="150">
            <template #default="scope">
              {{ scope.row.receiver_name }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <div class="order-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="viewOrderDetail(scope.row)"
                >
                  查看詳情
                </el-button>
                <el-button
                  v-if="scope.row.status === 0"
                  type="danger"
                  size="small"
                  @click="confirmCancelOrder(scope.row)"
                >
                  取消訂單
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <div v-else class="empty-orders">
        <el-empty description="您尚未有任何訂單" :image-size="200">
          <template #image>
            <img src="/img/QIANTA-d.svg" alt="暫無訂單" style="width: 160px" />
          </template>
          <el-button type="primary" @click="$router.push('/ProductsPage')">
            立即購物
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 分頁控制 -->
    <div v-if="orders.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalOrders"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 訂單詳情對話框 -->
    <OrderDetailModal
      v-model:visible="detailDialogVisible"
      :order="selectedOrder"
      @cancel-order="confirmCancelOrder"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, RefreshRight } from "@element-plus/icons-vue";
import { useUserInfoStore } from "@/stores/user";
import { getUserOrders, cancelOrder } from "@/api/order";
import OrderDetailModal from "./components/OrderDetailModal.vue";

// 初始化路由和 Store
const router = useRouter();
const userStore = useUserInfoStore();

// 狀態變數
const isLoading = ref(false);
const orders = ref<any[]>([]);
const totalOrders = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 篩選條件
const filterStatus = ref<number | null>(null);
const dateRange = ref<[string, string] | null>(null);

// 訂單詳情對話框
const detailDialogVisible = ref(false);
const selectedOrder = ref<any>(null);

// 訂單狀態文字和標籤類型

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待處理";
    case 1:
      return "已發貨";
    case 2:
      return "已取消";
    default:
      return "未知狀態";
  }
};

// 訂單狀態標籤類型
const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return "warning";
    case 1:
      return "success";
    case 2:
      return "info";
    default:
      return "info";
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// 獲取訂單列表
const fetchOrders = async () => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入");
    router.push({ path: "/login", query: { redirect: "/OrderListPage" } });
    return;
  }

  isLoading.value = true;
  try {
    // 將搜索條件轉換為查詢參數
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    if (filterStatus.value !== null) {
      params.status = filterStatus.value;
    }

    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }

    // 發送API請求
    const response: any = await getUserOrders(userStore.token);
    console.log("訂單列表響應:", response);

    if (response && response.code === 0) {
      // 這裡假設後端返回的數據結構包含訂單列表和總數
      // 根據實際API調整這部分
      orders.value = response.data || [];
      totalOrders.value = orders.value.length;

      // 應用前端篩選 (如果後端沒有支援篩選功能)
      if (filterStatus.value !== null) {
        orders.value = orders.value.filter(
          (order) => order.status === filterStatus.value
        );
      }

      if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
        // 起始日期設為當天的 00:00:00
        const startDateObj = new Date(dateRange.value[0]);
        startDateObj.setHours(0, 0, 0, 0);
        const startDate = startDateObj.getTime();

        // 結束日期設為當天的 23:59:59.999
        const endDateObj = new Date(dateRange.value[1]);
        endDateObj.setHours(23, 59, 59, 999);
        const endDate = endDateObj.getTime();

        orders.value = orders.value.filter((order) => {
          const orderDate = new Date(order.created_time).getTime();
          return orderDate >= startDate && orderDate <= endDate;
        });
      }

      totalOrders.value = orders.value.length;
    } else {
      ElMessage.error(response?.message || "獲取訂單列表失敗");
      orders.value = [];
      totalOrders.value = 0;
    }
  } catch (error: any) {
    console.error("獲取訂單列表錯誤:", error);

    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message);
    } else {
      ElMessage.error("獲取訂單列表失敗，請稍後再試");
    }

    orders.value = [];
    totalOrders.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// 重設篩選條件
const resetFilters = () => {
  filterStatus.value = null;
  dateRange.value = null;
  currentPage.value = 1;
  fetchOrders();
};

// 處理頁碼變更
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchOrders();
};

// 查看訂單詳情
const viewOrderDetail = (order: any) => {
  selectedOrder.value = order;
  detailDialogVisible.value = true;
};

// 確認取消訂單
const confirmCancelOrder = (order: any) => {
  // 檢查訂單狀態
  if (order.status !== 0) {
    ElMessage.warning("只能取消未發貨的訂單");
    return;
  }

  ElMessageBox.confirm(
    `您確定要取消訂單 ${order.order_number} 嗎？此操作不可逆。`,
    "取消訂單",
    {
      confirmButtonText: "確認取消",
      cancelButtonText: "返回",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        // 顯示加載狀態
        isLoading.value = true;

        // 呼叫取消訂單 API
        const response: any = await cancelOrder(userStore.token, order.id);

        if (response && response.code === 0) {
          ElMessage.success("訂單已成功取消");
          // 重新獲取訂單列表
          await fetchOrders();
        } else {
          ElMessage.error(response?.message || "取消訂單失敗");
        }
      } catch (error: any) {
        console.error("取消訂單錯誤:", error);

        if (error.response?.data?.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error("取消訂單失敗，請稍後再試");
        }
      } finally {
        isLoading.value = false;

        // 關閉詳情對話框（如果打開的話）
        if (detailDialogVisible.value) {
          detailDialogVisible.value = false;
        }
      }
    })
    .catch(() => {
      // 用戶取消了操作，不做處理
    });
};

// 組件掛載後初始化
onMounted(() => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入以查看您的訂單");
    router.push({ path: "/login", query: { redirect: "/OrderListPage" } });
    return;
  }

  // 獲取訂單列表
  fetchOrders();
});
</script>

<style scoped lang="scss">
.order-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;

  .page-title {
    font-size: 32px;
    color: $primary-b-d;
    margin-bottom: 32px;
  }

  .filter-section {
    margin-bottom: 24px;
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .filter-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      .el-select,
      .el-date-picker {
        width: 240px;
      }

      @media (max-width: 768px) {
        .el-select,
        .el-date-picker {
          width: 100%;
        }
      }
    }
  }

  .orders-container {
    margin-bottom: 32px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .order-table {
      width: 100%;

      .order-number {
        font-weight: 600;
        color: $primary-b-d;
      }

      .order-amount {
        font-weight: 700;
        color: $primary-y;
      }

      .order-actions {
        display: flex;
        gap: 8px;

        .el-button {
          margin-left: 0;
        }
      }
    }

    .empty-orders {
      padding: 48px;
      text-align: center;
    }

    .loading-container {
      padding: 24px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}

/* Element Plus 樣式覆蓋 */
:deep(.el-button--primary) {
  background-color: $primary-b-d;
  border-color: $primary-b-d;

  &:hover,
  &:focus {
    background-color: $primary-b;
    border-color: $primary-b;
  }
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: $primary-b-d;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-tag--warning) {
  background-color: rgba(255, 186, 96, 0.1);
  border-color: rgba(255, 186, 96, 0.2);
  color: #e6a23c;
}

:deep(.el-tag--success) {
  background-color: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(
    .el-table--striped
      .el-table__body
      tr.el-table__row--striped
      td.el-table__cell
  ) {
  background-color: #f9f9f9;
}

:deep(.el-table__body tr.hover-row > td.el-table__cell) {
  background-color: #f0f7ff !important;
}
</style>

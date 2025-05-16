<template>
  <el-dialog
    v-model="dialogVisible"
    title="訂單詳情"
    width="70%"
    destroy-on-close
    @closed="onDialogClosed"
  >
    <div v-if="order" class="order-detail">
      <div class="detail-header">
        <div class="detail-order-info">
          <div class="detail-info-item">
            <span class="label">訂單編號:</span>
            <span class="value">{{ order.order_number }}</span>
          </div>
          <div class="detail-info-item">
            <span class="label">訂單日期:</span>
            <span class="value">{{ formatDate(order.created_time) }}</span>
          </div>
          <div class="detail-info-item">
            <span class="label">訂單狀態:</span>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>
        </div>
      </div>
      
      <div class="detail-shipping">
        <h3>收貨信息</h3>
        <div class="shipping-grid">
          <div class="shipping-item">
            <span class="label">收件人:</span>
            <span class="value">{{ order.receiver_name }}</span>
          </div>
          <div class="shipping-item">
            <span class="label">聯絡電話:</span>
            <span class="value">{{ formatPhone(order.receiver_phone) }}</span>
          </div>
          <div class="shipping-item shipping-address">
            <span class="label">收貨地址:</span>
            <span class="value">{{ formatAddress(order) }}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-items">
        <h3>訂單商品</h3>
        <el-table :data="order.items" stripe style="width: 100%">
          <el-table-column label="商品圖片" width="120">
            <template #default="scope">
              <img 
                :src="getProductImageUrl(scope.row.image_url)" 
                :alt="scope.row.product_name" 
                class="detail-item-image"
              />
            </template>
          </el-table-column>
          <el-table-column prop="product_name" label="商品名稱" />
          <el-table-column prop="price" label="單價" width="120">
            <template #default="scope">
              ${{ scope.row.price.toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="數量" width="100" />
          <el-table-column label="小計" width="120">
            <template #default="scope">
              ${{ (scope.row.price * scope.row.quantity).toLocaleString() }}
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="detail-payment">
        <h3>付款信息</h3>
        <div class="payment-grid">
          <div class="payment-item">
            <span class="label">支付方式:</span>
            <span class="value">{{ getPaymentMethod(order.payment_method) }}</span>
          </div>
          <div class="payment-item">
            <span class="label">商品總額:</span>
            <span class="value">${{ (order.total_amount - order.shipping_fee).toLocaleString() }}</span>
          </div>
          <div class="payment-item">
            <span class="label">運費:</span>
            <span class="value">${{ order.shipping_fee.toLocaleString() }}</span>
          </div>
          <div class="payment-item payment-total">
            <span class="label">總計:</span>
            <span class="value total-price">${{ order.total_amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="order.note" class="detail-note">
        <h3>訂單備註</h3>
        <div class="note-content">
          {{ order.note }}
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">關閉</el-button>
        <el-button 
          v-if="order && order.status === 0" 
          type="danger" 
          @click="onCancelOrder"
        >
          取消訂單
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';

// 定義props - 接收訂單數據
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
});

// 定義事件
const emit = defineEmits(['update:visible', 'cancel-order']);

// 對話框狀態
const dialogVisible = ref(props.visible);

// 監聽visible變化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
});

// 監聽對話框狀態變化
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 訂單狀態文字
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待處理';
    case 1: return '已發貨';
    default: return '未知狀態';
  }
};

// 訂單狀態標籤類型
const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'warning';
    case 1: return 'success';
    default: return 'info';
  }
};

// 支付方式文字
const getPaymentMethod = (method: number) => {
  switch (method) {
    case 1: return '貨到付款';
    default: return '未知方式';
  }
};

// 獲取商品圖片 URL
const getProductImageUrl = (url?: string) => {
  if (!url) return '/img/placeholder.png';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:3007${url}`;
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 格式化電話號碼（保護隱私）
const formatPhone = (phone: string) => {
  if (!phone) return '-';
  // 顯示前兩碼和後兩碼，中間用星號替代
  return phone.slice(0, 2) + '******' + phone.slice(-2);
};

// 格式化地址
const formatAddress = (order: any) => {
  if (!order) return '-';
  return `${order.city}${order.district}${order.address}`;
};

// 對話框關閉後的處理
const onDialogClosed = () => {
  // 可以在這裡做一些清理工作
};

// 取消訂單
const onCancelOrder = () => {
  if (!props.order) return;
  emit('cancel-order', props.order);
};
</script>

<style scoped lang="scss">
.order-detail {
  .detail-header {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    
    .detail-order-info {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      
      .detail-info-item {
        .label {
          color: $text-d;
          margin-right: 8px;
        }
        
        .value {
          font-weight: 600;
          color: $primary-b-d;
        }
      }
    }
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: $primary-b-d;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .detail-shipping, .detail-payment, .detail-note {
    margin-bottom: 32px;
  }
  
  .shipping-grid, .payment-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    .shipping-item, .payment-item {
      display: flex;
      
      .label {
        color: $text-d;
        margin-right: 8px;
        min-width: 80px;
      }
      
      .value {
        font-weight: 500;
      }
      
      &.shipping-address, &.payment-total {
        grid-column: span 2;
      }
      
      &.payment-total {
        margin-top: 8px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
        
        .value.total-price {
          color: $primary-y;
          font-size: 20px;
          font-weight: 700;
        }
      }
    }
  }
  
  .detail-items {
    margin-bottom: 32px;
    
    .detail-item-image {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }
  }
  
  .note-content {
    background-color: #f9f9f9;
    padding: 16px;
    border-radius: 8px;
    color: $text-d;
    line-height: 1.6;
  }
}

/* Element Plus 樣式覆蓋 */
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

:deep(.el-table th.el-table__cell) {
  background-color: #f9f9f9;
}

:deep(.el-button--danger) {
  background-color: #f56c6c;
  border-color: #f56c6c;
  
  &:hover, &:focus {
    background-color: #f78989;
    border-color: #f78989;
  }
}

:deep(.dialog-footer) {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
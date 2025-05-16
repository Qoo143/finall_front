<template>
  <div class="checkout-page">
    <div class="checkout-content">
      <!-- 左側 - 配送資訊表單 -->
      <div class="shipping-form">
        <h2>配送資訊</h2>
        <el-form
          :model="shippingInfo"
          :rules="shippingRules"
          ref="shippingFormRef"
          label-position="top"
          class="form-container"
        >
          <el-form-item label="收件人姓名" prop="receiver_name">
            <el-input
              v-model="shippingInfo.receiver_name"
              placeholder="請輸入收件人姓名"
            />
          </el-form-item>

          <el-form-item label="聯絡電話" prop="receiver_phone">
            <el-input
              v-model="shippingInfo.receiver_phone"
              placeholder="請輸入聯絡電話"
            />
          </el-form-item>

          <el-form-item label="城市" prop="city">
            <el-select
              v-model="shippingInfo.city"
              placeholder="請選擇城市"
              class="full-width"
              @change="onCityChange"
            >
              <el-option
                v-for="city in cityList"
                :key="city.CityName"
                :label="city.CityName"
                :value="city.CityName"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="區域" prop="district">
            <el-select
              v-model="shippingInfo.district"
              placeholder="請選擇區域"
              :disabled="!shippingInfo.city"
              class="full-width"
            >
              <el-option
                v-for="district in districtList"
                :key="district.ZipCode"
                :label="district.AreaName"
                :value="district.AreaName"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="詳細地址" prop="address">
            <el-input
              v-model="shippingInfo.address"
              placeholder="請輸入詳細地址"
              type="textarea"
              :rows="2"
            />
          </el-form-item>

          <el-form-item label="訂單備註" prop="note">
            <el-input
              v-model="orderNote"
              placeholder="有什麼需要告訴我們的嗎？"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 右側 - 訂單摘要 -->
      <div class="order-summary">
        <h2>訂單摘要</h2>

        <!-- 購物車商品 -->
        <div class="cart-items-container">
          <div v-if="cartStore.items.length > 0" class="cart-items">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="summary-item"
            >
              <div class="item-image">
                <img
                  :src="getProductImageUrl(item.image_url)"
                  :alt="item.name"
                />
              </div>
              <div class="item-details">
                <h3 class="item-name">{{ item.name }}</h3>
                <div class="item-quantity">數量: {{ item.quantity }}</div>
                <div class="item-price">${{ item.price.toLocaleString() }}</div>
              </div>
              <div class="item-subtotal">
                ${{ (item.price * item.quantity).toLocaleString() }}
              </div>
            </div>
          </div>
          <div v-else class="empty-cart-message">
            <p>購物車內沒有商品</p>
            <el-button @click="$router.push('/ProductsPage')"
              >前往購物</el-button
            >
          </div>
        </div>

        <!-- 訂單金額計算 -->
        <div class="order-totals">
          <div class="total-row">
            <span>商品小計</span>
            <span>${{ cartStore.totalAmount.toLocaleString() }}</span>
          </div>
          <div class="total-row">
            <span>運費</span>
            <span>${{ shippingFee.toLocaleString() }}</span>
          </div>
          <div class="total-row grand-total">
            <span>訂單總計</span>
            <span
              >${{
                (cartStore.totalAmount + shippingFee).toLocaleString()
              }}</span
            >
          </div>
        </div>

        <!-- 支付選項 -->
        <div class="payment-method">
          <h3>付款方式</h3>
          <div class="payment-option">
            <el-radio v-model="paymentMethod" :label="1" class="payment-radio">
              <span class="payment-label">貨到付款</span>
            </el-radio>
          </div>
        </div>

        <!-- 提交按鈕 -->
        <div class="checkout-actions">
          <el-button
            @click="$router.push('/ProductsPage')"
            class="continue-shopping"
          >
            繼續購物
          </el-button>
          <el-button
            type="primary"
            :loading="isSubmitting"
            @click="submitOrder"
            class="submit-order"
            :disabled="cartStore.items.length === 0"
          >
            提交訂單
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useCartStore } from "@/stores/cart";
import { useUserInfoStore } from "@/stores/user";
import cityCountyData from "@/utils/CityCountyData.json";
import { createOrder } from "@/api/order";

// 初始化路由和 Store
const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserInfoStore();

// 表單參考及提交狀態
const shippingFormRef = ref<FormInstance>();
const isSubmitting = ref(false);

// 城市和地區資料
const cityList = ref(cityCountyData);
const districtList = ref<any[]>([]);

// 表單數據
const shippingInfo = reactive({
  receiver_name: "",
  receiver_phone: "",
  city: "",
  district: "",
  address: "",
});

// 訂單備註和付款方式
const orderNote = ref("");
const paymentMethod = ref(1); // 默認為貨到付款

// 運費設置 
const shippingFee = ref(0); // 暫時固定運費為 0 元

// 表單驗證規則
const shippingRules = reactive<FormRules>({
  receiver_name: [
    { required: true, message: "請輸入收件人姓名", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "姓名長度必須在 2 到 50 個字元之間",
      trigger: "blur",
    },
  ],
  receiver_phone: [
    { required: true, message: "請輸入聯絡電話", trigger: "blur" },
    {
      pattern: /^09\d{8}$/,
      message: "請輸入有效的台灣手機號碼（格式：09xxxxxxxx）",
      trigger: "blur",
    },
  ],
  city: [{ required: true, message: "請選擇城市", trigger: "change" }],
  district: [{ required: true, message: "請選擇區域", trigger: "change" }],
  address: [
    { required: true, message: "請輸入詳細地址", trigger: "blur" },
    {
      min: 5,
      max: 100,
      message: "地址長度必須在 5 到 100 個字元之間",
      trigger: "blur",
    },
  ],
});

// 在城市選擇變更時更新區域列表
const onCityChange = () => {
  shippingInfo.district = "";
  updateDistrictList();
};

// 更新區域列表函數
const updateDistrictList = () => {
  if (!shippingInfo.city) {
    districtList.value = [];
    return;
  }

  const selectedCity = cityList.value.find(
    (city) => city.CityName === shippingInfo.city
  );
  districtList.value = selectedCity ? selectedCity.AreaList : [];
};

// 獲取商品圖片 URL
const getProductImageUrl = (url: string) => {
  if (!url) return "/img/placeholder.png";
  if (url.startsWith("http")) return url;
  return `http://127.0.0.1:3007${url}`;
};

// 提交訂單
const submitOrder = async () => {
  if (!shippingFormRef.value) return;

  // 驗證表單
  await shippingFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("請填寫完整的配送資訊");
      return;
    }

    // 檢查購物車是否為空
    if (cartStore.items.length === 0) {
      ElMessage.warning("購物車為空，請先添加商品");
      return;
    }

    try {
      isSubmitting.value = true;

      // 構建訂單數據
      const orderData = {
        shipping: {
          receiver_name: shippingInfo.receiver_name,
          receiver_phone: shippingInfo.receiver_phone,
          city: shippingInfo.city,
          district: shippingInfo.district,
          address: shippingInfo.address,
        },
        payment_method: paymentMethod.value,
        note: orderNote.value,
        items: cartStore.items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      // 發送創建訂單請求
      const response: any = await createOrder(userStore.token, orderData);

      // 處理響應
      if (response && response.code === 0) {
        // 清空購物車
        await cartStore.clearCart();

        // 顯示成功訊息
        ElMessageBox.alert(
          `訂單已成功創建，訂單編號：${response.data.order_number}`,
          "訂單提交成功",
          {
            confirmButtonText: "查看我的訂單",
            callback: () => {
              router.push("/OrderListPage");
            },
          }
        );
      } else {
        ElMessage.error(response?.message || "訂單創建失敗，請稍後再試");
      }
    } catch (error: any) {
      console.error("訂單提交錯誤:", error);

      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message);
      } else {
        ElMessage.error("訂單提交失敗，請稍後再試");
      }
    } finally {
      isSubmitting.value = false;
    }
  });
};

// 組件掛載後初始化
onMounted(() => {
  // 檢查用戶是否已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入後再進行結帳");
    router.push({ path: "/login", query: { redirect: "/checkout" } });
    return;
  }

  // 檢查購物車是否為空
  if (cartStore.items.length === 0) {
    ElMessage.warning("購物車為空，請添加商品後再結帳");
  }
});
</script>
<style scoped lang="scss">
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;

  .page-title {
    font-size: 32px;
    color: $primary-b-d;
    margin-bottom: 32px;
  }

  .checkout-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: $primary-b-d;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
  }

  .shipping-form {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .form-container {
      margin-top: 16px;
    }

    .full-width {
      width: 100%;
    }
  }

  .order-summary {
    background-color: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .cart-items-container {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 24px;

      .summary-item {
        display: flex;
        padding: 16px 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          margin-right: 16px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .item-details {
          flex: 1;

          .item-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: $text-d;
          }

          .item-quantity,
          .item-price {
            font-size: 14px;
            color: $text-d;
            margin-bottom: 4px;
          }
        }

        .item-subtotal {
          font-size: 16px;
          font-weight: 700;
          color: $primary-y;
          min-width: 80px;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      }

      .empty-cart-message {
        padding: 32px 0;
        text-align: center;
        color: $text-d;

        p {
          margin-bottom: 16px;
        }
      }
    }

    .order-totals {
      background-color: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;

      .total-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 16px;
        color: $text-d;

        &:last-child {
          margin-bottom: 0;
        }

        &.grand-total {
          font-size: 20px;
          font-weight: 700;
          color: $primary-b-d;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
          margin-top: 12px;
        }
      }
    }

    .payment-method {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: $primary-b-d;
        margin-bottom: 16px;
      }

      .payment-option {
        padding: 16px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;

        .payment-radio {
          width: 100%;
          display: flex;
          align-items: center;

          .payment-label {
            font-size: 16px;
            margin-left: 8px;
          }
        }
      }
    }

    .checkout-actions {
      display: flex;
      gap: 16px;

      .el-button {
        flex: 1;
        height: 48px;
        font-size: 16px;
        font-weight: 600;
      }

      .continue-shopping {
        background-color: $bg-1;
        color: $text-d;
        border: none;

        &:hover {
          background-color: $bg-3;
        }
      }

      .submit-order {
        background-color: $primary-b-d;
        border: none;

        &:hover {
          background-color: $primary-b;
        }

        &:disabled {
          background-color: #a0aec0;
          color: white;
        }
      }
    }
  }
}

/* Element Plus 樣式覆蓋 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: $text-d;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: $primary-b-d;
  border-color: $primary-b-d;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: $primary-b-d;
}
</style>

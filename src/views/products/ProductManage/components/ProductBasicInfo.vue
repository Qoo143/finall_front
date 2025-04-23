<template>
  <div class="product-basic-info">
    <div class="headEdit">
      <div class="contentEdit">商品基本資料</div>
    </div>
    <!-- 商品名稱 -->
    <el-form-item label="商品名稱">
      <el-input v-model="model.name" placeholder="請輸入商品名稱" />
    </el-form-item>

    <!-- 商品價格 -->
    <el-form-item label="商品價格">
      <el-input
        v-model.number="model.price"
        type="number"
        placeholder="請輸入價格"
      />
    </el-form-item>

    <!-- 庫存：新增模式可直接編輯，編輯模式為只讀加操作區 -->
    <el-form-item label="庫存數量">
      <el-input
        v-model.number="model.stock"
        type="number"
        :readonly="!createMode"
        placeholder="請輸入庫存"
      />
    </el-form-item>

    <!-- 庫存變更邏輯（僅編輯模式出現） -->
    <el-form-item v-if="!createMode" label="更改庫存">
      <el-input
        v-model.number="stockDelta"
        type="number"
        style="max-width: 600px"
        placeholder="輸入要更動的數量"
        class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="stockActionType" style="width: 90px">
            <el-option label="添加" value="add" />
            <el-option label="減少" value="sub" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Select" @click="applyStockChange" />
        </template>
      </el-input>
    </el-form-item>

    <!-- 分類（下拉選單） -->
    <el-form-item label="商品分類">
      <el-select v-model="model.category_id" placeholder="請選擇分類" clearable>
        <el-option
          v-for="cat in allCategories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>
    </el-form-item>

    <!-- 標籤（自由輸入，最多三個） -->
    <el-form-item label="商品標籤">
      <el-input-tag
        v-model="model.tagNames"
        placeholder="輸入標籤名稱，按 Enter 確認，最多三個"
        :max="3"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Select } from "@element-plus/icons-vue";
import axios from "axios";

// 接收來自父層的 productData綁定
const model = defineModel<{
  name: string;
  price: number;
  stock: number;
  tagIds: number[];
  tagNames: string[];
  category_id: number;
}>({ required: true });

// 透過 props 傳入是否為創建模式
const props = defineProps<{ createMode: boolean }>();

// 所有分類資料
const allCategories = ref<{ id: number; name: string }[]>([]);

// 取得分類資料
onMounted(async () => {
  const res = await axios.get("http://127.0.0.1:3007/categories");
  allCategories.value = res.data.data || [];
});

// 點擊更改庫存（僅在編輯模式下）
const stockDelta = ref<number>(1);
const stockActionType = ref<"add" | "sub">("add");
function applyStockChange() {
  const delta =
    stockActionType.value === "add" ? stockDelta.value : -stockDelta.value;
  const next = model.value.stock + delta;
  if (next < 0) {
    alert("庫存不可小於 0");
    return;
  }
  model.value.stock = next;
  stockDelta.value = 1;
  stockActionType.value = "add";
}
</script>

<style scoped lang="scss">
.headEdit {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  .contentEdit {
    font-size: 24px;
    color: $primary-b-d;
    font-weight: 600;
  }
}
:deep(.el-form-item__label) {
  color: $primary-b-d;
}
</style>

<template>
  <el-dialog v-model="visible" title="刪除確認" width="500" align-center>
    <span>確定要刪除商品 {{ productName }} 嗎？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false" class="cancel">取消</el-button>
        <el-button type="danger" @click="confirmDelete">刪除</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import axios from "axios";

const visible = defineModel<boolean>("visible");
const productId = defineModel<number>("productId");
const productName = defineModel<string>("productName");

// 傳入刪除後要執行的 callback（例如刷新父頁面）
const props = defineProps<{
  onDeleted?: () => void;
}>();

const confirmDelete = async () => {
  try {
    const res = await axios.delete(
      `http://127.0.0.1:3007/products/${productId.value}`
    );
    if (res.data.code === 0) {
      ElMessage.success(`已刪除商品「${productName.value}」`);
      visible.value = false;
      //符合ts嚴謹性
      if (props.onDeleted) {
        props.onDeleted();
      }
    } else {
      ElMessage.error(res.data.message || "刪除失敗");
    }
  } catch (err) {
    console.error("刪除錯誤", err);
    ElMessage.error("刪除失敗");
  }
};
</script>

<style lang="scss" scoped>
:deep(.cancel.el-button) {
  border-radius: 8px;
  background-color: #e5eaf3 !important;
  color: $text-d;
}

:deep(.el-button) {
  border-radius: 8px;
  background-color: rgb(247, 137.4, 137.4) !important;
  color: $text-d;
}
</style>

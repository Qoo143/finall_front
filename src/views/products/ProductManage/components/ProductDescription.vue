<template>
  <div class="productDescription">
    <div class="headEdit">
      <div class="contentEdit">商品訊息描述</div>
    </div>
    <!-- 定義好寬高，前台顯示才不會跑版 -->

    <v-md-editor
      v-model="model.description"
      :disabled-menus="[]"
      height="300px"
      class="markdownEditor"
      placeholder="在此編寫商品描述"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
//這邊是md
const model = <any>defineModel<{ description: string }>();

const previewMode = ref(false); // 切換狀態：true = 預覽、false = 編輯
</script>

<style scoped lang="scss">
.productDescription {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

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
}
</style>

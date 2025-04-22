<template>
  <div class="productDescription">
    <div class="headEdit">
      <div class="contentEdit">商品訊息描述</div>
      <!-- 使用 Element Plus 的 el-input -->
      <el-input
        v-model="model.description"
        placeholder="請輸入商品描述"
        type="textarea"
        :rows="6"
        resize="none"
        class="fullHeight"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const model = <any>defineModel<{ description: string }>();
</script>

<style scoped lang="scss">
.productDescription {
  display: flex;
  height: 100%;
  width: 100%;

  .headEdit {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .contentEdit {
      font-size: 24px;
      color: $primary-b-d;
      font-weight: 600;
      text-align: center;
      margin-bottom: 16px;
    }
  }
}
// 強制調整 textarea 本體
.fullHeight {
  flex: 1;
  height: 100%;
}
:deep(.el-textarea__inner) {
  font-size: 20px;
  height: 100%;
  resize: none;
}
</style>

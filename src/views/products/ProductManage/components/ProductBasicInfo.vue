<template>
  <div class="headEdit">
    <div class="contentEdit">商品基本資料</div>
  </div>
  <el-form label-width="70px">
    <el-form-item label="商品名稱">
      <el-input v-model="model.name" placeholder="請輸入商品名稱" />
    </el-form-item>

    <el-form-item label="商品價格">
      <el-input v-model.number="model.price" type="number" />
    </el-form-item>

    <el-form-item v-if="createMode" label="庫存數量">
      <el-input v-model.number="model.stock" type="number" />
    </el-form-item>

    <el-form-item v-else label="庫1存數量">
      <el-input v-model.number="model.stock" type="number" />
    </el-form-item>

    <el-form-item label="更改庫存">
      <el-input
        v-model="input3"
        style="max-width: 600px"
        placeholder="填寫要增加或減少的數量"
        class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="select" style="width: 90px" placeholder="選擇">
            <el-option label="添加" value="1" />
            <el-option label="減少" value="0" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Select" />
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { Select } from "@element-plus/icons-vue";
const input3 = ref("");
const select = ref("1"); //預設為添加庫存
const createMode = ref("false"); //預設為新增模式

interface BasicInfo {
  name: string;
  price: number;
  stock: number;
  isListed: boolean;
  tagIds: number[];
}

interface Tag {
  id: number;
  name: string;
}

const model = defineModel<BasicInfo>({ required: true });
const allTags = ref<Tag[]>([]);

onMounted(async () => {
  const res = await axios.get("http://127.0.0.1:3007/tag");
  console.log(res);

  allTags.value = res.data.data || [];
});
</script>

<style scoped lang="scss">
.headEdit {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  .contentEdit {
  }
}
:deep(.el-form-item__label) {
  color: $primary-b-d;
}
</style>

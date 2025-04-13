<template>
  <div class="product-basic-info flex flex-col gap-6">
    <label>
      商品名稱
      <input
        v-model="model.name"
        type="text"
        placeholder="請輸入商品名稱"
        class="input"
      />
    </label>

    <label>
      價格（NT$）
      <input
        v-model.number="model.price"
        type="number"
        placeholder="請輸入價格"
        class="input"
      />
    </label>

    <label>
      庫存數量
      <input
        v-model.number="model.stock"
        type="number"
        placeholder="請輸入庫存"
        class="input"
      />
    </label>

    <label>
      商品標籤
      <div class="tag-list">
        <div
          v-for="tag in allTags"
          :key="tag.id"
          class="tag"
          :class="{ selected: model.tagIds.includes(tag.id) }"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }}
        </div>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { log } from "three/tsl";

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

function toggleTag(id: number) {
  const index = model.value.tagIds.indexOf(id);
  if (index >= 0) {
    model.value.tagIds.splice(index, 1);
  } else {
    model.value.tagIds.push(id);
  }
}
</script>

<style scoped lang="scss">
.input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #409eff;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: #e5e7eb; // default gray
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &.selected {
    background-color: #a7f3d0; // light green
    color: #065f46; // dark green
  }
}
</style>

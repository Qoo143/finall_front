<template>
  <el-dialog v-model="visible" title="商品詳情" width="800">
    <el-table :data="gridData">
      <el-table-column property="date" label="Date" width="150" />
      <el-table-column property="name" label="Name" width="200" />
      <el-table-column property="address" label="Address" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
const visible = defineModel<boolean>("visible");

const gridData = [
  {
    date: "2016-05-02",
    name: "John Smith",
    address: "No.1518,  Jinshajiang Road, Putuo District",
  },
  {
    date: "2016-05-04",
    name: "John Smith",
    address: "No.1518,  Jinshajiang Road, Putuo District",
  },
  {
    date: "2016-05-01",
    name: "John Smith",
    address: "No.1518,  Jinshajiang Road, Putuo District",
  },
  {
    date: "2016-05-03",
    name: "John Smith",
    address: "No.1518,  Jinshajiang Road, Putuo District",
  },
];
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

<template>
  <div class="bread-crumb">
    <el-icon>
      <Location />
    </el-icon>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>
        {{ props.name }}
      </el-breadcrumb-item>
    </el-breadcrumb>

  </div>
</template>

<script setup lang="ts">
const props = defineProps(['name'])
</script>

<style scoped lang="scss">
.bread-crumb {
  height: 30px;
  padding-left: 20px;
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 4px;
  }
}
</style>
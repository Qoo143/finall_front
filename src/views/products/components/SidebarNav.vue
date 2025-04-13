<template>
  <nav class="nav">
    <ul>
      <li>
        <el-icon><House /></el-icon
        ><RouterLink to="/products">商品列表</RouterLink>
      </li>
      <li>
        <el-icon><CirclePlus /></el-icon
        ><RouterLink to="/products/manage">新增商品</RouterLink>
      </li>
      <li>
        <el-icon><CollectionTag /></el-icon
        ><RouterLink to="/products/tag">標籤管理</RouterLink>
      </li>
      <li>
        <el-icon><Collection /></el-icon
        ><RouterLink to="/products/category">分類管理</RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<style scoped lang="scss">
.nav {
  padding: 32px 16px 16px 16px;
  background-color: $bg-1;

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 5px;
      a {
        text-decoration: none;
        color: #333;
        font-weight: 500;

        &:hover {
          color: $primary-b;
        }
      }
    }
  }
}
</style>

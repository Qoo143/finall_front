<template>
  <div class="layout">
    <Headpart class="header" />
    <div class="section">
      <SidebarNav class="sidebar" />
      <div class="main">
        <Breadcrumb class="breadcrumb" />
        <router-view class="content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from "@/views/products/components/SidebarNav.vue";
import Breadcrumb from "@/views/products/components/Breadcrumb.vue";
import Headpart from "@/views/products/components/Headpart.vue";
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100vh;

  .header {
    width: 100%;
    height: 60px;
    background-color: #e6e6e6;
  }
  .section {
    width: 100%;
    height: calc(100% - 80px);
    display: flex;

    .sidebar {
      width: 150px;
      background-color: #f5f5f5;
      border-right: 1px solid #ddd;
      justify-items: center;
    }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;

      .breadcrumb {
        padding: 12px 24px;
        background: #f9f9f9;
      }

      .content {
        flex: 1;
        padding: 24px;
        background: #f9f9f9;
        overflow-y: auto;
      }
    }
  }
}
</style>

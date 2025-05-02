<template>
  <div class="layout">
    <Headpart class="header" />

    <div class="section">
      <SidebarNav class="sidebar" />
      <div class="main">
        <Breadcrumb class="breadcrumb" />
        <!-- --------------------<<包裝動畫>>-------------------- -->
        <router-view v-slot="{ Component, route }">
          <transition name="route" mode="out-in" appear>
            <div class="content" :key="route.name">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from "@/views/products/components/SidebarNav.vue";
import Breadcrumb from "@/views/products/components/Breadcrumb.vue";
import Headpart from "@/components/Headpart.vue";
// import gsap from "gsap";
</script>

<style scoped lang="scss">
.layout {
  width: 100%;
  height: 100vh;
  background-color: $bg-3;

  .header {
    width: 100%;
    height: auto;
  }
  .section {
    width: 100%;
    height: calc(100% - 80px);
    display: flex;

    .sidebar {
      width: 150px;

      justify-items: center;
      border-radius: 0 24px 0 0;
    }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;

      .breadcrumb {
        padding: 12px 24px;
      }

      .content {
        flex: 1;
        padding: 16px 24px 16px 24px;
      }
    }
  }
}
//vue-animation
.route-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.route-enter-active {
  transition: all 0.5s ease;
}
.route-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.route-leave-active {
  transition: all 0.5s ease;
}
</style>

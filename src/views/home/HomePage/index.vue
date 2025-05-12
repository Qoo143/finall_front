<template>
  <div class="wrapper">
    <!-- 1.大圖 -->
    <CarAnimate />
    <!-- 2.歡迎 -->
    <Welcome />
    <!-- 3.滾動視差縮放 -->
    <Scale />
    <!-- 4.商品卡片橫向滾動 -->
    <ProductCard />
    <!-- 5.商品頁腳 -->
    <FooterInfo />
  </div>
</template>

<script setup lang="ts">
import CarAnimate from "@/views/home/HomePage/components/CarAnimate.vue";
import Welcome from "@/views/home/HomePage/components/Welcome.vue";
import Scale from "@/views/home/HomePage/components/Scale.vue";
import ProductCard from "@/views/home/HomePage/components/ProductCard.vue";
import FooterInfo from "@/views/home/HomePage/components/FooterInfo.vue";
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
}
</style>

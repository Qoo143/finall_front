<template>
  <div class="wrapper">
    <!-- 1.大圖 -->
    <CarAnimate />
    <!-- 2.歡迎 -->
    <div class="welcome">
      <div class="welcomeContent">
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint ut
          nobis sapiente vitae perferendis consectetur facere veritatis aperiam
          voluptate modi animi temporibus nemo perferendis totam iusto?
        </p>
        <p>
          architecto quo! Nobis odit repellendus tenetur sapiente sit! Doloribus
        </p>
        <p>uptatibus necessitatibus praesentium, nesci</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref, onMounted } from "vue";
// import gsap from "gsap";
import CarAnimate from "@/views/home/HomePage/components/CarAnimate.vue";
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;

  .welcome {
    width: 100%;
    height: 40vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(231, 231, 231);
    .welcomeContent {
      font-size: 2rem;
      width: 50%;
      margin: auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  }
}
</style>

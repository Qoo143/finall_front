<template>
  <div class="wrapper">
    <!-- 1.大圖 -->
    <div class="demoCar">
      <img src="/img/HomePage/niceC.jpg" alt="" />
    </div>
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

<script setup lang="ts"></script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100%;
  .demoCar {
    width: 100%;
    height: 80vh;
    max-width: 100%;
    img {
      width: 100%;
      height: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      display: block;
    }
  }
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

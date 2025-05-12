<template>
  <div class="wrapper">
    <!-- 上半部分 -->
    <div class="contentTop">
      <span class="sectionText">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, tempora?
      </span>
    </div>
    <!-- 下半部分 -->
    <div class="contentBottom">
      <ul class="leftUl">
        <li><a href="">測試</a></li>
        <li><a href="">測試</a></li>
        <li><a href="">測試</a></li>
        <li><a href="">測試</a></li>
      </ul>
      <ul class="centerUl">
        <li><a href="">測試測試</a></li>
        <li><a href="">測試測試</a></li>
        <li><a href="">測試測試</a></li>
        <li><a href="">測試測試</a></li>
        <li><a href="">測試測試</a></li>
        <li><a href="">測試測試</a></li>
      </ul>
      <ul class="rightUl">
        <li>
          <span>cool1</span>
          <ul>
            <li><a href="">Purchasing</a></li>
            <li><a href="">Purchasing</a></li>
            <li><a href="">Purchasing</a></li>
            <li><a href="">Purchasing</a></li>
            <li><a href="">Purchasing</a></li>
          </ul>
        </li>
        <li>
          <span>cool2</span>
          <ul>
            <li><a href="">Purchasing2</a></li>
          </ul>
        </li>
        <li>
          <span>cool3</span>
          <ul>
            <li><a href="">Purchasing3</a></li>
          </ul>
        </li>
      </ul>
    </div>
    <span class="logo">
      <p>Copyright © 2025 QianTa.All rights reserved.</p>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
</script>

<style scoped lang="scss">
.wrapper {
  position: relative;
  width: 100%;
  background-color: #333957;
  .contentTop {
    width: 100%;
    display: flex;
    height: 30%;
    padding: 6rem;
    gap: 2rem;
    .sectionText {
      font-size: 2rem;
      color: rgb(243, 248, 252);
      margin: auto;
      margin-left: 0;
    }
  }
  .contentBottom {
    display: flex;
    height: 70%;
    padding: 5rem 6rem;
    justify-content: space-between;
    background-color: rgb(44, 47, 61);

    ul {
      display: inline-block;
      list-style: none;
      a {
        text-decoration: none;
        color: rgb(233, 233, 243);
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .leftUl {
      font-size: 2rem;
      li {
        padding: 0.5rem;
      }
    }
    .centerUl {
      font-size: 1.5rem;
      li {
        padding: 0.5rem;
      }
    }
    .rightUl {
      font-size: 1.2rem;
      display: flex;
      gap: 6rem;
      width: 50%;
      span {
        color: #b4b5b6;
        padding-left: 0.5rem;
      }
      li {
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
        width: 100%;
      }
    }
  }
  .logo {
    display: flex;
    position: absolute;
    left: 50%;
    bottom: 5rem;
    transform: translateX(-50%);
    z-index: 20;
    color: rgb(165, 165, 165);
  }
}
</style>

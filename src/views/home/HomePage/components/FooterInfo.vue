<template>
  <div class="wrapper">
    <!-- 上半部分 -->
    <div class="contentTop">
      <span class="sectionText">
        駕馭未來不僅是一種選擇，更是一種生活態度。
      </span>
    </div>
    <!-- 下半部分 -->
    <div class="contentBottom">
      <ul class="leftUl">
        <li><a href="">關於我們</a></li>
        <li><a href="">品牌故事</a></li>
        <li><a href="">新聞中心</a></li>
        <li><a href="">招賢納士</a></li>
      </ul>
      <ul class="centerUl">
        <li><a href="">產品系列</a></li>
        <li><a href="">智慧座艙</a></li>
        <li><a href="">動力系統</a></li>
        <li><a href="">創新科技</a></li>
        <li><a href="">安全保障</a></li>
        <li><a href="">專利技術</a></li>
      </ul>
      <ul class="rightUl">
        <li>
          <span>車主服務</span>
          <ul>
            <li><a href="">購車指南</a></li>
            <li><a href="">金融方案</a></li>
            <li><a href="">預約試駕</a></li>
            <li><a href="">維修保養</a></li>
            <li><a href="">充電網絡</a></li>
          </ul>
        </li>
        <li>
          <span>探索QianTa</span>
          <ul>
            <li><a href="">虛擬展廳</a></li>
            <li><a href="">設計理念</a></li>
            <li><a href="">技術白皮書</a></li>
            <li><a href="">未來願景</a></li>
            <li><a href="">碳中和計劃</a></li>
          </ul>
        </li>
        <li>
          <span>聯繫我們</span>
          <ul>
            <li><a href="">門店查詢</a></li>
            <li><a href="">在線客服</a></li>
            <li><a href="">媒體合作</a></li>
            <li><a href="">投資關係</a></li>
            <li><a href="">隱私政策</a></li>
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
        margin-bottom: 1rem;
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

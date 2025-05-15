<template>
  <header class="navbar">
    <!-- 固定寬度的導航容器 -->
    <div
      :class="{
        navbar__container: true,
        white: isWhitePage,
      }"
    >
      <!-- 左側選單 -->
      <nav class="navbar__left">
        <button @click="onClickMenu">選單</button>
        <button @click="goto('home')">首頁</button>
        <button @click="goto('ProductsPage')">商品</button>
        <button>訂單</button>
        <button>關於</button>
      </nav>

      <!-- 中間 Logo -->
      <div class="navbar__center">
        <img src="/img/QIANTA2.svg" alt="Logo" class="navbar__logo" />
      </div>

      <!-- 右側購物車和用戶選項 -->
      <div class="navbar__right">
        <button @click="openCart" class="cart-button">
          購物車
          <span v-if="cartStore.totalItems > 0" class="cart-badge">
            {{ cartStore.totalItems }}
          </span>
        </button>

        <!-- 已登入用戶選項 -->
        <div v-if="userStore.isLoggedIn" class="user-options">
          <!-- 用戶下拉選單 -->
          <div class="user-dropdown">
            <!-- 顯示用戶名稱的按鈕 - 點擊顯示下拉選單 -->
            <button class="user-button" @click="toggleUserDropdown">
              {{ userStore.userName }}
              <el-icon
                :class="{
                  'dropdown-icon': true,
                  'dropdown-open': isUserDropdownOpen,
                }"
              >
                <arrow-down />
              </el-icon>
            </button>

            <!-- 下拉選單內容 -->
            <div v-show="isUserDropdownOpen" class="dropdown-menu">
              <ul>
                <li @click="goto('OrderListPage')">我的訂單</li>
                <li @click="goto('profile')">個人資料</li>
                <li @click="handleLogout" class="logout-item">登出</li>
              </ul>
            </div>
          </div>

          <!-- 管理員才顯示的前往後台按鈕 -->
          <button
            v-if="userStore.isAdmin"
            @click="goToAdmin"
            class="admin-button"
          >
            前往後台
          </button>
        </div>

        <!-- 未登入顯示登入按鈕 -->
        <button v-else @click="goto('login')" class="login-button">登入</button>
      </div>
    </div>

    <!-- 引入購物車側邊欄 -->
    <CartSidebar v-model:visible="cartVisible" @checkout="goCheckout" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import CartSidebar from "@/views/home/components/CartSidebar.vue"; //購物車
import { useCartStore } from "@/stores/cart";
import { useUserInfoStore } from "@/stores/user";
import { ElMessage } from "element-plus"; // 引入提示訊息組件
import { ArrowDown } from "@element-plus/icons-vue"; // 引入下拉箭頭圖標

// 初始化路由和 Store
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const userStore = useUserInfoStore();

// 控制購物車側邊欄顯示狀態
const cartVisible = ref(false);

// 控制用戶下拉選單顯示狀態
const isUserDropdownOpen = ref(false);

/**
 * 跳轉
 */
const goto = (name: string) => {
  router.push(`/${name}`);
  isUserDropdownOpen.value = false; // 跳轉時關閉下拉選單
};

/**
 * 顯示/隱藏用戶下拉選單
 */
const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

/**
 * 點擊下拉選單外部時關閉選單
 */
const closeDropdownOnClickOutside = (event: MouseEvent) => {
  if (isUserDropdownOpen.value) {
    const target = event.target as HTMLElement;
    // 獲取用戶按鈕元素 (使用樣式選擇器可能不夠可靠，這裡只是示例)
    const userButton = document.querySelector(".user-button");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    // 如果點擊的不是用戶按鈕也不是下拉選單內的元素，則關閉選單
    if (
      userButton &&
      dropdownMenu &&
      !userButton.contains(target) &&
      !dropdownMenu.contains(target)
    ) {
      isUserDropdownOpen.value = false;
    }
  }
};

// 掛載時添加全局點擊事件監聽器
onMounted(() => {
  document.addEventListener("click", closeDropdownOnClickOutside);
});

// 卸載前移除全局點擊事件監聽器
onBeforeUnmount(() => {
  document.removeEventListener("click", closeDropdownOnClickOutside);
});

function onClickMenu() {
  alert("選單被點了！");
}

//判斷所在頁面變換class
// 判斷是否在商品頁面
const isWhitePage = computed(() => {
  return (
    route.path.includes("/ProductsPage") || route.path.includes("/checkout")
  );
});

/**
 * 打開購物車側邊欄
 */
const openCart = () => {
  cartVisible.value = true;
};

/**
 * 前往結帳頁面
 */
const goCheckout = () => {
  // 確認用戶已登入
  if (!userStore.isLoggedIn) {
    ElMessage.warning("請先登入才能進行結帳");
    router.push({ path: "/login", query: { redirect: "/checkout" } });
    return;
  }

  // 前往結帳頁面
  router.push("/checkout");
};

/**
 * 處理用戶登出
 */
const handleLogout = () => {
  userStore.logout();
  ElMessage.success("已成功登出");
  cartStore.clearCart(); // 清空購物車
  router.push("/home"); // 跳轉到首頁
};

/**
 * 前往後台管理頁面 (只有管理員才會看到此按鈕)
 */
const goToAdmin = () => {
  if (userStore.isAdmin) {
    router.push("/products");
  } else {
    ElMessage.warning("您沒有管理員權限");
  }
};
</script>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 60px;
  background-color: transparent;
  color: white;

  // 內容容器
  &__container {
    position: relative;
    max-width: 1440px; // 設置一個最大寬度
    height: 100%;
    margin: 0 auto; // 居中
    padding-left: 1rem;
    display: grid;
    grid-template-columns: 1fr auto 1fr; // 三列布局：左側、中間、右側
    align-items: center;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-self: start; // 靠左
  }

  &__center {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    justify-self: end; // 靠右
    .cart-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .cart-badge {
      background-color: $primary-y;
      color: white;
      border-radius: 50%;
      font-size: 12px;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 5px;
    }

    .user-options {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-dropdown {
      position: relative;

      .user-button {
        display: flex;
        align-items: center;
        gap: 5px;
        border: 1px solid white;

        .dropdown-icon {
          font-size: 12px;
          transition: transform 0.3s;
        }

        .dropdown-open {
          transform: rotate(180deg);
        }
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 5px);
        right: 0;
        width: 150px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;
        overflow: hidden;

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            padding: 12px 16px;
            color: $text-d;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background-color: $bg-1;
            }

            &.logout-item {
              color: #f56c6c;
              border-top: 1px solid #f0f0f0;
            }
          }
        }
      }
    }

    .admin-button {
      background-color: $primary-y;
      color: $text-d;
      font-weight: 500;
    }
  }

  &__logo {
    height: 1.5rem;
  }

  button {
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 0.5rem;
    cursor: pointer;

    &:hover {
      background-color: #414141;
    }
  }
}

//判斷路徑轉換顏色
.white {
  button {
    color: black;
    border-radius: 0.5rem;
    background-color: #e7e7e7;

    &:hover {
      background-color: $primary-b-ll;
    }
  }
  .navbar__right {
    button {
      background-color: transparent;

      &:hover {
        background-color: $primary-b-ll;
      }
    }

    .admin-button {
      background-color: $primary-y;
      color: $text-d;

      &:hover {
        background-color: darken($primary-y, 80%);
      }
    }

    .cart-badge {
      background-color: $primary-b-d;
      color: white;
    }

    .user-dropdown {
      .user-button {
        border: 1px solid #ddd;
      }

      .dropdown-menu {
        background-color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        ul li {
          color: $text-d;

          &:hover {
            background-color: #f5f5f5;
          }
        }
      }
    }
  }
}

//克制icon
.custom-icon {
  font-size: 2rem;
}
</style>

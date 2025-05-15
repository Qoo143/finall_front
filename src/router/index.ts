import { createRouter, createWebHashHistory } from "vue-router";
import { useUserInfoStore } from '@/stores/user';
//--------------------<<路由區>>-------------------------

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    //預設轉向
    {
      path: "/",
      redirect: "/home",
    },
    //1.登入註冊
    {
      path: "/login",
      component: () => import("@/views/login/index.vue"), 
      children: [
        {
          path: "",
          name: "Login",
          component: () => import("@/views/login/components/LoginForm.vue"), // 登入表單  
        },
        {
          path: "/register",
          name: "Register",
          component: () => import("@/views/login/components/RegisterForm.vue"), // 註冊表單
        },
      ],
    },
    //2.後台商品管理區
    {
      path: "/products",
      name: "products",
      component: () => import("@/views/products/index.vue"),
      meta: { requiresAuth: true, requiresAdmin: true }, // '登入'與'管理員'權限檢查
      children: [
        {
          //商品列表
          path: "",
          name: "ProductList",
          component: () => import("@/views/products/ProductList/index.vue"),
          meta: { breadcrumb: ["商品列表"] },
        },
        {
          // 無 id，進入新增模式
          path: "manage",
          name: "ProductManageCreate",
          component: () => import("@/views/products/ProductManage/index.vue"),
          meta: { breadcrumb: ["商品管理", "新增商品"] },
        },
        {
          // 有 id，進入編輯模式
          path: "manage/:id",
          name: "ProductManageEdit",
          component: () => import("@/views/products/ProductManage/index.vue"),
          props: true,
          meta: { breadcrumb: ["商品管理", "編輯商品"] },
        },
        {
          //標籤管理
          path: "tag",
          name: "ProductTagEdit",
          component: () => import("@/views/products/ProductTag/index.vue"),
          props: true,
          meta: { breadcrumb: ["商品管理", "標籤管理"] },
        },
        {
          //分類管理
          path: "category",
          name: "ProductCategoryEdit",
          component: () => import("@/views/products/ProductCategory/index.vue"),
          props: true,
          meta: { breadcrumb: ["商品管理", "分類管理"] },
        },
      ],
    },
    //3.前台用戶區
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/home/index.vue"),
      children: [
        //3.1主頁面(一頁式.)
        {
          path: "",
          name: "HomePage",
          component: () => import("@/views/home/HomePage/index.vue"),
        },
        //3.2商品頁面
        {
          path: "/ProductsPage",
          name: "ProductsPage",
          component: () => import("@/views/home/ProductsPage/index.vue"),
        },
        //3.3訂單頁面
        {
          path: "/OrderListPage",
          name: "OrderListPage",
          component: () => import("@/views/home/OrderListPage/index.vue"),
            meta: { requiresAuth: true } // 需要登入才能訪問
        },
        //3.4結帳頁面
        {
          path: "/checkout",
          name: "checkout",
          component: () => import("@/views/home/CheckoutPage/index.vue"),
          meta: { requiresAuth: true } // 需要登入才能訪問
        }
      ],
    },
  ],
});

// 添加全局前置守衛
router.beforeEach((to, from, next) => {
  const userStore = useUserInfoStore();
  
  // 1. 檢查路由是否需要登入身份
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 未登入，跳轉到登入頁面，並保存原目標路徑
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    });
    return;
  }
  
  // 2. 檢查路由是否需要管理員權限
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    // 已登入但不是管理員，返回首頁並提示
    console.warn("用戶不具備管理員權限，無法訪問該頁面");
    next({ path: '/home' });
    // 這裡配合 Element Plus 顯示一個提示訊息
    // 但由於 router 不能直接訪問組件方法，可能需要通過 localStorage 或其他方式傳遞訊息
    
    return;
  }
  
  // 其他情況正常訪問
  next();
});


export default router;

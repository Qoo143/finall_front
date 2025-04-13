import { createRouter, createWebHashHistory } from 'vue-router'

//--------------------<<路由區>>-------------------------

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 預設轉向
    {
      path: '/',
      redirect: '/products'
    },
    //登入註冊
    {
      path: '/login',
      component: () => import('@/views/login/index.vue'), // 包含 tab 切換邏輯
      children: [
        {
          path: '',
          name: 'Login',
          component: () => import('@/views/login/components/LoginForm.vue') // 登入表單
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/views/login/components/RegisterForm.vue') // 註冊表單
        }
      ]
    },
    //後台商品管理區
    {
      path: '/products',
      component: () => import('@/views/products/index.vue'),
      children: [
        {//商品列表
          path: '',
          name: 'ProductList',
          component: () => import('@/views/products/ProductList/index.vue'),
          meta: { breadcrumb: ['商品管理'] },
        },
        {// 無 id，進入新增模式
          path: 'manage',
          name: 'ProductManageCreate',
          component: () => import('@/views/products/ProductManage/index.vue'),
          meta: { breadcrumb: ['商品管理', '新增商品'] },
        },
        {// 有 id，進入編輯模式
          path: 'manage/:id',
          name: 'ProductManageEdit',
          component: () => import('@/views/products/ProductManage/index.vue'),
          props: true,
          meta: { breadcrumb: ['商品管理', '編輯商品'] },
        },
        {//標籤管理
          path: 'tag',
          name: 'ProductTagEdit',
          component: () => import('@/views/products/ProductTag/index.vue'),
          props: true,
          meta: { breadcrumb: ['商品管理', '標籤管理'] },
        },
        {//分類管理
          path: 'category',
          name: 'ProductCategoryEdit',
          component: () => import('@/views/products/ProductCategory/index.vue'),
          props: true,
          meta: { breadcrumb: ['商品管理', '分類管理'] },
        },

      ],
    },
    //前台用戶區
  ]
})

export default router

import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserInfoStore } from '@/stores/user';//要判斷請求頭token
import { tokenManager } from '@/utils/tokenManager';

//--------------------<<axios實例>>-------------------------

const instance = axios.create({
  baseURL: 'http://127.0.0.1:3007',  //後端url網址
  timeout: 10000,                     //設置超時     
  headers: {                         //請求頭設定  
    "Content-Type": 'application/x-www-form-urlencoded'
  }
})

// 請求攔截
instance.interceptors.request.use(function (config) {
  // 獲取 store (不能使用 import 方式，因為這會造成循環依賴)
  const userStore = useUserInfoStore();
  
  // 如果有 token 且請求需要添加 token
  if (userStore.token && config.headers) {
    // 檢查 token 是否過期
    if (tokenManager.isTokenExpired(userStore.token)) {
      // token 已過期，清除登入狀態
      userStore.logout();
      
      // 可以在這裡顯示一個通知
      ElMessage.warning('登入已過期，請重新登入');
      
      // 跳轉到登入頁 (需要使用 setTimeout 避免在攔截器中直接使用 router)
      setTimeout(() => {
        window.location.href = '/#/login';
      }, 1500);
      
      // 拒絕這個請求
      return Promise.reject(new Error('登入已過期'));
    }
    
    // token 有效，添加到請求頭
    config.headers.Authorization = userStore.token;
  }
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 響應攔截
instance.interceptors.response.use(function (response) {
  //若返回訊息status=0 (成功)
  if (response.data.code === 0) {
    ElMessage({
      message: response.data.message, //由後端返回
      type: 'success',
    })
  }
  return response.data;
}, function (error) {
  if (error && error.response) {
    switch (error.response.status) {
      case 400:
        ElMessage.error('請求錯誤')
        break
      case 401:
        ElMessage.error('未經授權，請先登入')
        break
      case 403:
        ElMessage.error('拒絕訪問')
        break
      case 404:
        ElMessage.error(`請求地址出錯:${error.response.config.url}`)
        break
      case 500:
        ElMessage.error('服務器內部出錯')
        break
      default:
        ElMessage.error(`連接出錯:${error.response.status}`)
    }
  }

  return Promise.reject(error);
});

export default instance
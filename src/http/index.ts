import axios from 'axios';
import { ElMessage } from 'element-plus';

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
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 響應攔截
instance.interceptors.response.use(function (response) {
  //若返回訊息status=0 (成功)
  if (response.data.status === 0) {
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
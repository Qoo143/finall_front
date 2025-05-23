//--------------------<<引入區>>-------------------------

import instance from '@/http/index';

//--------------------<<路由說明>>-------------------------
//這邊會返回一個function給前端作為 "綁定事件"
//因此前端要先導入(import)後才能使用該function
//--------------------<<前端路由區>>-------------------------

//註冊接口
// 增加註冊 API 函數
export const register = (data: any): any => {
  const {
    account,
    password,
  } = data
  return instance({
    url: '/api/regist', // 根據你的 router/login.js 路由
    method: 'POST',
    data: {
      account,
      password,
    }
  })
}

//登入接口
export const login = (data: any): any => {
  return instance({
    url: '/api/login',
    method: 'POST',
    data
  })
}

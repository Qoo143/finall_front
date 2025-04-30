import { ref } from 'vue';
import { defineStore } from 'pinia';
import { login } from '@/api/login';

export const useUserInfoStore = defineStore('userInfo', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const account = ref<string>(localStorage.getItem('account') || '');
  const userName = ref<string>('QooFromStore');
  const imageUrl = ref<string>('/img/user.jfif');
  const isLoggedIn = ref<boolean>(!!token.value);

  // ✅ 登入方法
  const userLogin = async (loginData: { account: string; password: string }) => {
    try {
      const res = await login(loginData);
      console.log('回傳結果:', res);

      if (res.code === 0) {
        const userData = res.data; // ✅ 先取出 data 再操作

        token.value = userData.token;
        account.value = userData.account;
        userName.value = userData.username || '未知使用者';
        imageUrl.value = userData.image_url || '/img/user.jfif';
        isLoggedIn.value = true;

        localStorage.setItem('token', token.value);
        localStorage.setItem('account', account.value);

        return Promise.resolve(res);
      } else {
        return Promise.reject(new Error(res.message || '登入失敗'));
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  // ✅ 登出方法
  const logout = () => {
    token.value = '';
    account.value = '';
    isLoggedIn.value = false;
    localStorage.removeItem('token');
    localStorage.removeItem('account');
  };

  // ✅ 一定要 return
  return {
    token,
    account,
    userName,
    imageUrl,
    isLoggedIn,
    userLogin,
    logout,
  };
}, {
  persist: true
});

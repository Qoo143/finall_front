import { ref } from 'vue';
import { defineStore } from 'pinia';
import { login } from '@/api/login';
import { useRouter } from 'vue-router';
import { tokenManager } from '@/utils/tokenManager';
const router = useRouter()

export const useUserInfoStore = defineStore('userInfo', () => {
  const token = ref<string>(localStorage.getItem('token') || '');
  const account = ref<string>(localStorage.getItem('account') || '');
  const userName = ref<string>('QooFromStore');
  const imageUrl = ref<string>('/img/user.jfif');
  const isLoggedIn = ref<boolean>(false);
  const isAdmin = ref<boolean>(true); // 預設為管理員

  // 在初始化時檢查 token 是否有效
  if (token.value) {
    isLoggedIn.value = !tokenManager.isTokenExpired(token.value);

    // 如果 token 已過期，自動清除
    if (!isLoggedIn.value) {
      token.value = '';
      localStorage.removeItem('token');
      localStorage.removeItem('account');
    }
  }

  // ✅ 登入方法
  const userLogin = async (loginData: { account: string; password: string }) => {
    try {
      const res = await login(loginData);
      console.log('回傳結果:', res);

      if (res.code === 0) {
        const userData = res.data; // ✅ 先取出 data 再操作

        token.value = userData.token;
        account.value = userData.account;
        isAdmin.value = userData.identity === 1,
          userName.value = userData.name || '使用者';
        imageUrl.value = userData.image_url || '/img/user.jfif';
        isLoggedIn.value = true;

        // localStorage.setItem('token', token.value);
        // localStorage.setItem('account', account.value);

        // 確保路由切換完成
        window.location.href = '/products';

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
    userName.value = '使用者'; // 重置為默認名稱
    imageUrl.value = '/img/user.jfif';
    isLoggedIn.value = false;
    isAdmin.value = false; // 重置管理員權限
  };

  // 檢查 token 是否即將過期（例如還有 5 分鐘過期）
  const isTokenAboutToExpire = () => {
    if (!token.value) return false;

    const expirationTime = tokenManager.getTokenExpirationTime(token.value);
    if (!expirationTime) return false;

    // 檢查是否在 5 分鐘內過期
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return expirationTime < fiveMinutesFromNow;
  };

  // ✅ 一定要 return
  return {
    token,
    account,
    userName,
    imageUrl,
    isLoggedIn,
    isAdmin,
    userLogin,
    logout,
    isTokenAboutToExpire
  };
}, {
  persist: true
});

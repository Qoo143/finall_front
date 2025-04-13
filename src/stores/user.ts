import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getUserInfo } from '@/api/user';

export const useUserInfo = defineStore(
  //定義store名稱
  'userInfo', () => {
    //定義數據
    const imageUrl = ref<string>('')
    //定義方法 獲取用戶信息
    const userInfo = async (account: number) => {
      const res = await getUserInfo(account) as any
      imageUrl.value = res.image_url
    }
    //向外暴露的數據
    return {
      imageUrl, userInfo
    }
  }, {
  persist: true, //是否持久化
}
)
import { ref } from 'vue';
import { defineStore } from 'pinia';
// import { getUserInfo } from '@/api/user';

export const useUserInfoStore = defineStore(

  'userInfo', () => {

    const imageUrl = ref<string>('/img/user.jfif')
    //定義方法 獲取用戶信息
    // const userInfo = async (account: number) => {
    //   const res = await getUserInfo(account) as any
    //   imageUrl.value = res.image_url
    // }
    const userName = ref("QooFromStore")
    //向外暴露的數據
    return {
      imageUrl, userName
    }
  }, {
  persist: true, //是否持久化
}
)
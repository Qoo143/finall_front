import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)//引入插件

export default pinia

//注意 : pinia刷新後會將所有的store清空，所以要注意這點
//引入插件使數據持久化
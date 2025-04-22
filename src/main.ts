//----------<<基本引入>>----------
import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'


//----------<<ElementPlus引入>>----------
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhtw from 'element-plus/es/locale/lang/zh-tw'

//掛載根組件到app實例
const app = createApp(App)

//引入element-plus的圖標
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}


app
  .use(router)
  .use(pinia)
  .use(ElementPlus, { locale: zhtw, })
  .mount('#app')

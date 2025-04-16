//----------<<基本引入>>----------
import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores'
import router from './router'


//----------<<ElementPlus引入>>----------
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhtw from 'element-plus/es/locale/lang/zh-tw'

//----------<MarkDown編輯器引入>>----------
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';

//----------<<使用 GitHub 樣式>>----------

import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import hljs from 'highlight.js';
VMdEditor.use(githubTheme, {
  Hljs: hljs,
});

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
  .use(VMdEditor)
  .mount('#app')

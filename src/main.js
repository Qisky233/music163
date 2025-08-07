import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 导入 Ant Design for Vue
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

// 导入 Pinia
import { createPinia } from 'pinia'

// 导入 Axios 并配置
import axios from 'axios'

// 导入路由
import router from './router'

export const app = createApp(App)

// 安装 Ant Design for Vue
app.use(Antd)

// 安装 Pinia
const pinia = createPinia()
app.use(pinia)

// 安装路由
app.use(router)

// 配置 Axios 全局属性
app.config.globalProperties.$axios = axios

// 挂载应用
app.mount('#app')

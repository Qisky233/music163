import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有网络接口
    port: 3000, // 你可以指定端口号，例如 3000
  }
});
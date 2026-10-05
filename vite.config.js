import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    // 绑定 IPv4 环回地址，避免 localhost 解析到 IPv6 ::1 触发 EACCES
    host: '127.0.0.1',
    port: 5173,
  },
})
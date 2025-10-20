import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // 允许通过外部域名（如 loca.lt、cloudflare tunnels）访问
    allowedHosts: [
      // 通配 loca.lt 子域
      ".loca.lt",
      // 也允许 cloudflared 默认域名
      ".trycloudflare.com"
    ]
  }
})

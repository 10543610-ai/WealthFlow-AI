import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 載入環境變數 (支援 .env 檔案與系統變數)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: './', 
    build: {
      outDir: 'dist',
    },
    define: {
      // 為 Gemini SDK 填補 process.env.API_KEY
      // 優先讀取 VITE_API_KEY (GitHub Actions 設定的名稱)
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    }
  };
});
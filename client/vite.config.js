import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        secure: false,
        changeOrigin: true, // Ensure the origin header is correctly set

      },
    },
  },
  plugins: [react()],
});

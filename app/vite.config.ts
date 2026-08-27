import path from "path"
import { sites } from "@openai/sites-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const workerConfig = {
  main: "./worker/index.ts",
  compatibility_date: "2026-05-22",
  assets: {
    binding: "ASSETS",
    not_found_handling: "single-page-application" as const,
  },
}

export default defineConfig(async () => {
  const { cloudflare } = await import("@cloudflare/vite-plugin")

  return {
    base: './',
    plugins: [
      react(),
      sites(),
      cloudflare({ viteEnvironment: { name: "server" }, config: workerConfig }),
    ],
    server: {
      port: 3000,
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  }
})

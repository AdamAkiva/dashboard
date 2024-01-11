import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import { defineConfig, type UserConfig } from "vite";

/**********************************************************************************/

export default defineConfig(({ command }): UserConfig => {
  const sharedConfig = {
    root: "./",
    envPrefix: "SMC",
    publicDir: "./public",
    plugins: [vue()],
    resolve: {
      alias: [
        {
          find: "@",
          replacement: fileURLToPath(new URL("./src", import.meta.url)),
        },
      ],
    },
  };

  if (command === "build") {
    return {
      ...sharedConfig,
      build: {
        outDir: "./build",
      },
      esbuild: {
        drop: ["console", "debugger"],
      },
    };
  }

  return {
    ...sharedConfig,
    css: {
      devSourcemap: true,
    },
    server: {
      host: "0.0.0.0",
      port: Number(process.env.CLIENT_PORT),
      strictPort: true,
    },
  };
});

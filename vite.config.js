import { defineConfig, defaultClientConditions } from "vite";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig({
  plugins: [
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  resolve: {
    conditions: defaultClientConditions,
    // Add validator to the list of modules to be pre-bundled
    dedupe: ['validator']
  },
  json: {
    stringify: 'auto',
    namedExports: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    minify: "terser",
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["qrcode", "file-saver", "validator"],
        },
        // Ensure proper module resolution in production
        format: 'es',
        // Ensure validator is properly bundled
        preserveModules: false,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
  },
});

/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { gitStatusPlugin } from "./vite-plugins/git-status";

export default defineConfig({
    plugins: [react(), gitStatusPlugin()],
    server: {
        port: 5173
    },
    test: {
        globals: true,
        environment: "jsdom"
    }
});

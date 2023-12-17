import dotenv from "dotenv";
dotenv.config();

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        // Makes @ resolve to src for more readable import filepaths
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFilesAfterEnv: "./testSetup.js",
    },
});

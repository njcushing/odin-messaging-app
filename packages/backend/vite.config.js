import dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        globals: true,
    },
});

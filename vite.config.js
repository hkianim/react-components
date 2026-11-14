import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    build: {
        lib: {
            entry: "src/index.js",
            formats: ["es"],
            fileName: "index",
        },

        rollupOptions: {
            external: [
                "react",
                "react-dom",
                /^react\//,
                /^react-dom\//,
                "@mui/material",
                /^@mui\/material\//,
                "@mui/icons-material",
                /^@mui\/icons-material\//,
                "@emotion/react",
                "@emotion/styled",
            ],
        },
    },
});

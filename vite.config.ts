import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macrosPlugin from 'vite-plugin-babel-macros';
import checker from 'vite-plugin-checker';

export default defineConfig({
    base: '/',
    plugins: [
        react(),
        macrosPlugin(),
        checker({
            eslint: {
                // for example, lint .ts and .tsx
                lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
            },
            // e.g. use TypeScript check
            typescript: true,
        }),
        {
            name: 'html-transform',
            transformIndexHtml(html) {
                return html
                    .replace(/__BUILD_TIME__/g, Date.now().toString())
                    .replace(
                        /__VERSION__/g,
                        process.env.npm_package_version || '1.0.0',
                    );
            },
        },
    ],
    define: {
        'import.meta.env': {},
        global: {},
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
    },
});

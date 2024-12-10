import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
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
                const gitHash = execSync('git rev-parse --short HEAD')
                    .toString()
                    .trim();
                return html
                    .replace(/__BUILD_TIME__/g, Date.now().toString())
                    .replace(/__PRINT__/g, gitHash)
                    .replace(
                        /__VERSION__/g,
                        process.env.npm_package_version || '1.0.0',
                    );
            },
        },
        visualizer({
            open: false, // Automatically open the report in the browser
        }),
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

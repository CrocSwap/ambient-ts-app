import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import optimizePlugin from './plugins/vite-plugin-optimize';

export default defineConfig({
    base: '/',
    plugins: [
        // Base plugins
        react({
            // React 17+ JSX transform is used by default
        }),

        // Type checking
        checker({
            typescript: true,
            eslint: {
                lintCommand: 'eslint --ext .ts,.tsx',
            },
        }),

        // HTML transformation
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

        // Custom optimizations
        ...optimizePlugin(),
    ],
    define: {
        'import.meta.env': {},
        global: {},
        'process.env': {}, // Prevents "process is not defined" errors
        'process.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN': JSON.stringify(
            process.env.NEXT_PUBLIC_SECURE_SITE_ORIGIN ||
                'https://secure.walletconnect.org',
        ),
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'build',
        sourcemap: process.env.NODE_ENV !== 'production', // Only in development
        minify: 'esbuild',
        cssCodeSplit: true,
        reportCompressedSize: false, // Disable gzip size reporting for better build performance
        chunkSizeWarningLimit: 1000, // Increase chunk size warning limit (in kbs)
        rollupOptions: {
            output: {
                // Let Vite handle chunking automatically with these overrides
                manualChunks: (id) => {
                    // Group all node_modules into a single vendor chunk
                    if (id.includes('node_modules/')) {
                        return 'vendor';
                    }
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
            },
        },
    },
});

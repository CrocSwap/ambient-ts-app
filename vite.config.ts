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
                manualChunks: (id) => {
                    // Keep React and its dependencies together
                    if (
                        id.includes('node_modules/react') ||
                        id.includes('node_modules/scheduler') ||
                        id.includes('node_modules/scheduler/')
                    ) {
                        return 'vendor';
                    }

                    // Keep charting libraries and their dependencies together
                    if (
                        id.includes('node_modules/recharts') ||
                        id.includes('node_modules/d3-') ||
                        id.includes('node_modules/d3-')
                    ) {
                        return 'vendor';
                    }

                    // Group UI libraries
                    if (
                        id.includes('node_modules/@radix-ui') ||
                        id.includes('node_modules/@radix-ui/')
                    ) {
                        return 'vendor';
                    }

                    // Group utility libraries
                    if (
                        id.includes('node_modules/lodash') ||
                        id.includes('node_modules/date-fns') ||
                        id.includes('node_modules/ramda')
                    ) {
                        return 'vendor';
                    }

                    // Group other node modules
                    if (id.includes('node_modules/')) {
                        return 'vendor';
                    }

                    // Group application code by feature
                    if (id.includes('src/components/')) {
                        const match = id.match(/src\/components\/([^/]+)/);
                        return match ? `components-${match[1]}` : 'components';
                    }
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
            },
        },
    },
});

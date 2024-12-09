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
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.toLowerCase().includes('ui/dist/esm')) {
                        return 'esm';
                    } else if (id.toLowerCase().includes('react-reveal')) {
                        return 'reveal'; // works
                    } else if (id.toLowerCase().includes('react-icons')) {
                        return 'icons'; // works
                    } else if (id.toLowerCase().includes('styled-components')) {
                        return 'styled-components'; // works
                    } else if (id.toLowerCase().includes('ens-normalize')) {
                        return 'ens'; // works
                    } else if (id.toLowerCase().includes('lodash')) {
                        return 'lodash'; // works
                    } else if (id.toLowerCase().includes('re-resizeable')) {
                        return 'resizeable'; // works
                    } else if (id.toLowerCase().includes('intro.js')) {
                        return 'intro'; // works
                    } else if (id.toLowerCase().includes('stablelib')) {
                        return 'stablelib'; // works
                    } else if (id.toLowerCase().includes('numbro')) {
                        return 'numbro'; // works
                    } else if (id.toLowerCase().includes('moment')) {
                        return 'moment'; // works
                    } else if (id.toLowerCase().includes('i18')) {
                        return 'i18'; // works
                    } else if (id.toLowerCase().includes('zod')) {
                        return 'zod'; // works
                    } else if (id.toLowerCase().includes('noble')) {
                        return 'noble'; // works
                    } else if (id.toLowerCase().includes('siwe')) {
                        return 'siwe'; // works
                    } else if (id.toLowerCase().includes('framer')) {
                        return 'framer'; // works
                    } else if (
                        id.toLowerCase().includes('universal-provider')
                    ) {
                        return 'provider'; // works
                    } else if (id.toLowerCase().includes('walletconnect')) {
                        return 'walletconnect'; // works
                    } else if (id.toLowerCase().includes('web3modal')) {
                        return 'web3modal'; // works
                    } else if (
                        id.toLowerCase().includes('emoji-picker-react')
                    ) {
                        return 'emoji-picker-react'; // works
                    } else if (
                        id.toLowerCase().includes('material-ui') ||
                        id.toLowerCase().includes('popper') ||
                        id.toLowerCase().includes('mui')
                    ) {
                        return 'material-ui'; // works
                    } else if (id.toLowerCase().includes('bignumber')) {
                        return 'bignumber'; // works
                    } else if (id.toLowerCase().includes('node_modules')) {
                        return 'vendor'; // General vendor chunk for everything else in node_modules
                    } else if (id.toLowerCase().includes('assets')) {
                        return 'assets'; // works
                    } else if (id.toLowerCase().includes('futa')) {
                        return 'futa'; // works
                    } else if (id.toLowerCase().includes('chat')) {
                        return 'chat'; // works
                    } else if (id.toLowerCase().includes('utils')) {
                        return 'utils'; // works
                    } else if (id.toLowerCase().includes('global')) {
                        return 'global'; // works
                    } else if (id.toLowerCase().includes('trade')) {
                        return 'trade'; // works
                    } else if (id.toLowerCase().includes('components')) {
                        return 'components'; // works
                    } else if (id.toLowerCase().includes('form')) {
                        return 'form'; // works
                    }
                },
            },
        },
    },
});

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
                    if (id.endsWith('.css')) {
                        return 'styles'; // Combine all CSS into the "styles" chunk
                    } else if (
                        id.toLowerCase().includes('eventemitter3') ||
                        id.toLowerCase().includes('cross-fetch') ||
                        id.toLowerCase().includes('multiformats') ||
                        id.toLowerCase().includes('dayjs') ||
                        id.toLowerCase().includes('css-vendor') ||
                        id.toLowerCase().includes('bignumber') ||
                        id.toLowerCase().includes('zod') ||
                        id.toLowerCase().includes('stablelib') ||
                        id.toLowerCase().includes('lodash')
                    ) {
                        return 'libs-1';
                    } else if (id.toLowerCase().includes('lib.esm')) {
                        return 'lib.esm';
                    } else if (id.toLowerCase().includes('ui/dist/esm')) {
                        return 'esm';
                    } else if (
                        id.toLowerCase().includes('numbro') ||
                        id.toLowerCase().includes('moment') ||
                        id.toLowerCase().includes('siwe')
                    ) {
                        return 'libs-2';
                    } else if (id.toLowerCase().includes('web3modal')) {
                        return 'web3modal';
                    } else if (
                        id.toLowerCase().includes('material-ui') ||
                        id.toLowerCase().includes('popper') ||
                        id.toLowerCase().includes('mui') ||
                        id.toLowerCase().includes('react-color') ||
                        id.toLowerCase().includes('re-resizable') ||
                        id.toLowerCase().includes('@emotion') ||
                        id.toLowerCase().includes('styled-components') ||
                        id.toLowerCase().includes('framer-motion')
                    ) {
                        return 'libs-3';
                    } else if (
                        id.toLowerCase().includes('emoji-picker-react')
                    ) {
                        return 'emoji-picker-react';
                    } else if (id.toLowerCase().includes('ethers')) {
                        return 'ethers';
                    } else if (
                        id.toLowerCase().includes('aes-js') ||
                        id.toLowerCase().includes('tslib') ||
                        id.toLowerCase().includes('motionone') ||
                        id.toLowerCase().includes('noble')
                    ) {
                        return 'aes-js';
                    } else if (
                        id.toLowerCase().includes('remix-run') ||
                        id.toLowerCase().includes('react-router') ||
                        id.toLowerCase().includes('react-dom') ||
                        id.toLowerCase().includes('react-use-websocket') ||
                        id.toLowerCase().includes('intro.js')
                    ) {
                        return 'libs-4';
                    } else if (id.toLowerCase().includes('d3')) {
                        return 'd3';
                    } else if (
                        id.toLowerCase().includes('coinbase') ||
                        id.toLowerCase().includes('utils/dist/index.es.js')
                    ) {
                        return 'coinbase';
                    } else if (
                        id.toLowerCase().includes('walletconnect') ||
                        id.toLowerCase().includes('universal-provider') ||
                        id.toLowerCase().includes('qrcode')
                    ) {
                        return 'walletconnect';
                    } else if (
                        id.toLowerCase().includes('reactcss') ||
                        id.toLowerCase().includes('react-transition-group') ||
                        id.toLowerCase().includes('react-jazzicon') ||
                        id.toLowerCase().includes('react-blockies') ||
                        id.toLowerCase().includes('react-reveal') ||
                        id.toLowerCase().includes('react-icons') ||
                        id.toLowerCase().includes('tinycolor2') ||
                        id.toLowerCase().includes('sha.js') ||
                        id.toLowerCase().includes('popmotion') ||
                        id.toLowerCase().includes('modern-screenshot') ||
                        id.toLowerCase().includes('crocswap-libs')
                    ) {
                        return 'libs-5';
                    } else if (id.toLowerCase().includes('node_modules')) {
                        return 'vendor'; // General vendor chunk for everything else in node_modules
                    } else if (id.toLowerCase().includes('assets')) {
                        return 'assets';
                    } else if (id.toLowerCase().includes('futa')) {
                        return 'futa';
                    } else if (id.toLowerCase().includes('chat')) {
                        return 'chat';
                    } else if (id.toLowerCase().includes('global')) {
                        return 'global';
                    } else if (id.toLowerCase().includes('trade')) {
                        return 'trade';
                    } else if (id.toLowerCase().includes('components')) {
                        return 'components';
                    } else if (id.toLowerCase().includes('platformambient')) {
                        return 'platformAmbient';
                    }
                },
            },
        },
    },
});

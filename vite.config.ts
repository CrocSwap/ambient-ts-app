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
                    if (id.toLowerCase().includes('react-dom')) {
                        return 'reactdom';
                    } else if (id.toLowerCase().includes('react-color')) {
                        return 'reactcolor';
                    } else if (id.toLowerCase().includes('react-icons')) {
                        return 'reacticons';
                    } else if (id.toLowerCase().includes('react-reveal')) {
                        return 'reactreveal';
                    } else if (id.toLowerCase().includes('websocket')) {
                        return 'websocket';
                    } else if (id.toLowerCase().includes('emoji')) {
                        return 'emoji';
                    } else if (id.toLowerCase().includes('react')) {
                        return 'react';
                    } else if (id.toLowerCase().includes('styled')) {
                        return 'styled';
                    } else if (id.toLowerCase().includes('buffer')) {
                        return 'buffer';
                    } else if (id.toLowerCase().includes('commonjs')) {
                        return 'commonjs';
                    } else if (id.toLowerCase().includes('p5')) {
                        return 'p5';
                    } else if (id.toLowerCase().includes('lodash')) {
                        return 'lodash';
                    } else if (
                        id.toLowerCase().includes('mui') ||
                        id.toLowerCase().includes('material')
                    ) {
                        return 'mui';
                    } else if (id.toLowerCase().includes('d3')) {
                        return 'd3';
                    } else if (id.toLowerCase().includes('moment')) {
                        return 'moment';
                    } else if (id.toLowerCase().includes('numbro')) {
                        return 'numbro';
                    } else if (id.toLowerCase().includes('bignumber')) {
                        return 'bignumber';
                    } else if (id.toLowerCase().includes('i18')) {
                        return 'i18';
                    } else if (id.toLowerCase().includes('siwe')) {
                        return 'siwe';
                    } else if (id.toLowerCase().includes('scaffold')) {
                        return 'scaffold';
                    } else if (id.toLowerCase().includes('web3modal')) {
                        return 'web3modal';
                    } else if (id.toLowerCase().includes('provider')) {
                        return 'provider';
                    } else if (id.toLowerCase().includes('walletconnect')) {
                        return 'walletconnect';
                    } else if (id.toLowerCase().includes('coinbase')) {
                        return 'coinbase';
                    } else if (id.toLowerCase().includes('ethers')) {
                        return 'ethers';
                    } else if (id.toLowerCase().includes('framer')) {
                        return 'framer';
                    } else if (id.toLowerCase().includes('qrcode')) {
                        return 'qrcode';
                    } else if (id.toLowerCase().includes('zod')) {
                        return 'zod';
                    } else if (id.toLowerCase().includes('crocswap')) {
                        return 'crocswap';
                    } else if (id.toLowerCase().includes('ens')) {
                        return 'ens';
                    } else if (id.toLowerCase().includes('noble')) {
                        return 'noble';
                    } else if (id.toLowerCase().includes('chart')) {
                        return 'chart';
                    } else if (id.toLowerCase().includes('assets')) {
                        return 'assets';
                    } else if (id.toLowerCase().includes('global')) {
                        return 'global';
                    } else if (id.toLowerCase().includes('trade')) {
                        return 'trade';
                    } else if (id.toLowerCase().includes('futa')) {
                        return 'futa';
                    } else if (id.toLowerCase().includes('chat')) {
                        return 'chat';
                    } else if (id.toLowerCase().includes('home')) {
                        return 'home';
                    } else if (id.toLowerCase().includes('form')) {
                        return 'form';
                    } else if (id.toLowerCase().includes('rangeactionmodal')) {
                        return 'rangeactionmodal';
                    } else if (id.toLowerCase().includes('utils')) {
                        return 'utils';
                    } else if (id.toLowerCase().includes('components')) {
                        return 'components';
                    } else if (id.toLowerCase().includes('node_modules')) {
                        return 'vendor'; // General vendor chunk for everything else in node_modules
                    }
                },
            },
        },
    },
});

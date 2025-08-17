import { PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';

export default function optimizePlugin(): PluginOption[] {
    return [
        // HTML optimization
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    // Add any variables you need in your HTML
                    buildTime: Date.now(),
                },
            },
        }),

        // Bundle analyzer (development only)
        process.env.NODE_ENV === 'production' &&
            visualizer({
                open: false,
                filename: 'dist/stats.html',
                gzipSize: true,
                brotliSize: true,
            }),
    ];
}

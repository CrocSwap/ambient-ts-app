/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { writeFileSync } from 'fs';

const manifest = {
    short_name: 'Ambient',
    name: 'Ambient',
    icons: [
        {
            src: process.env.FAVICON_SRC || 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon',
        },
        {
            src:
                process.env.ANDROID_CHROME_192_SRC ||
                'android-chrome-192x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
        },
        {
            src: process.env.MASKABLE_ICON_SRC || 'maskable_icon.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
        },
        {
            src:
                process.env.ANDROID_CHROME_512_SRC ||
                'android-chrome-512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
        },
    ],
    start_url: '.',
    display: 'standalone',
    theme_color: '#7371fc',
    background_color: '#7371fc',
};

writeFileSync('./public/site.webmanifest', JSON.stringify(manifest, null, 2));
console.log('site.webmanifest generated!');

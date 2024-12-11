/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { config } from 'dotenv';
import { writeFileSync } from 'fs';

// Load .env.local
// config({ path: '.env.futa' });
config({ path: '.env.local' });

const manifest = {
    short_name: process.env.MANIFEST_NAME || 'Ambient',
    name: process.env.MANIFEST_NAME || 'Ambient',
    icons: [
        {
            src: process.env.FAVICON_SRC || 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon',
        },
        {
            src:
                process.env.MANIFEST_SITE_LOGO_x192 ||
                'android-chrome-192x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
        },
        {
            src: process.env.MANIFEST_SITE_LOGO_x192 || 'maskable_icon.png',
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

writeFileSync('./build/site.webmanifest', JSON.stringify(manifest, null, 2));
console.log('site.webmanifest generated!');

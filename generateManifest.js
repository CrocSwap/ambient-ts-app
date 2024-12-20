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
            src: process.env.VITE_SITE_ICON_x48 || 'icons/ambient_icon_x48.png',
            sizes: '48x48',
            type: 'image/png',
        },
        {
            src: process.env.VITE_SITE_ICON_x72 || 'icons/ambient_icon_x72.png',
            sizes: '72x72',
            type: 'image/png',
        },
        {
            src: process.env.VITE_SITE_ICON_x96 || 'icons/ambient_icon_x96.png',
            sizes: '96x96',
            type: 'image/png',
        },
        {
            src:
                process.env.VITE_SITE_ICON_x128 ||
                'icons/ambient_icon_x128.png',
            sizes: '128x128',
            type: 'image/png',
        },
        {
            src:
                process.env.VITE_SITE_ICON_x192 ||
                'icons/ambient_icon_x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
        },
        // {
        //     src:
        //         process.env.VITE_SITE_ICON_x256 ||
        //         'icons/ambient_icon_x256.png',
        //     sizes: '256x256',
        //     type: 'image/png',
        // },
        {
            src:
                process.env.VITE_SITE_ICON_x512 ||
                'icons/ambient_icon_x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
        },
    ],
    start_url: '/',
    display: 'standalone',
    theme_color: process.env.MANIFEST_COLOR || '#7371fc',
    background_color: process.env.MANIFEST_COLOR || '#7371fc',
    screenshots: [
        {
            src:
                process.env.VITE_SITE_SCREENSHOT_WIDE ||
                'screenshots/ambient-screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
        },
        {
            src:
                process.env.VITE_SITE_SCREENSHOT_NARROW ||
                'screenshots/ambient-screenshot-narrow.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
        },
    ],
};

writeFileSync('./build/site.webmanifest', JSON.stringify(manifest, null, 2));
console.log('site.webmanifest generated!');

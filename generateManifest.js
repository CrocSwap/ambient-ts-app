/* eslint-disable no-undef */
/* eslint-disable camelcase */
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import path from 'path';

// Load .env.local
config({ path: '.env.local' });

// Determine the output directory based on the environment
const isLocalBuild = process.env.LOCAL_BUILD === 'true';
const outputPath = isLocalBuild
    ? path.resolve('./site.webmanifest') // Write to the root directory
    : path.resolve('./build/site.webmanifest'); // Write to the build directory

const manifest = {
    short_name: process.env.MANIFEST_NAME || 'Ambient',
    name: process.env.MANIFEST_NAME || 'Ambient',
    id: process.env.MANIFEST_ID || '/',
    start_url: '/',
    display_override: ['window-controls-overlay', 'fullscreen', 'minimal-ui'],
    display: 'fullscreen',
    theme_color: process.env.MANIFEST_COLOR || '#7371fc',
    background_color: process.env.MANIFEST_COLOR || '#7371fc',
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
        {
            src:
                process.env.VITE_SITE_ICON_x512 ||
                'icons/ambient_icon_x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
        },
    ],
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

writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
console.log(`site.webmanifest generated at: ${outputPath}`);

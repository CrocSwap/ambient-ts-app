import { brandAssetsIF } from './types';
import large from '../images/logos/large.svg';

export const blastBrandAssets: brandAssetsIF = {
    networks: [
        '0x13e31', // blast
    ],
    color: {
        '0x1': 'purple_dark',
        '0x82750': 'purple_dark',
        '0x5': 'purple_dark',
        '0x8274f': 'purple_dark',
        '0xaa36a7': 'purple_dark',
        '0xa0c71fd': 'purple_dark',
        '0x13e31': 'purple_dark',
    },
    platformName: '',
    headerImage: large as string,
    showPoints: true,
    showDexStats: true,
    heroImage: '/src/assets/images/home/home_wallpaper_compressed.png',
};

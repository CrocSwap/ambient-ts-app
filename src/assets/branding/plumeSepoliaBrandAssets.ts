import { brandIF } from './types';
import large from '../images/logos/large.svg';
import plumeLogo from '../../assets/images/logos/plume_brand_logo.svg';

export const plumeSepoliaBrandAssets: brandIF = {
    networks: {
        // plume sepolia
        '0x18230': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: plumeLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'plumeSepolia',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};

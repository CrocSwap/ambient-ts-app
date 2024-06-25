import { brandIF } from './types';
import large from '../images/logos/large.svg';
import plumeLogo from '../../assets/images/logos/plume_brand_logo.svg';

export const plumeSepoliaBrandAssets: brandIF = {
    networks: {
        // plume sepolia
        '0x99c0a0f': {
            color: 'sepolia_light',
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
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

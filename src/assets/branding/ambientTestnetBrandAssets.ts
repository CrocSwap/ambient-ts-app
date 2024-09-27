import { brandIF } from './types';
import large from '../images/logos/large.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';

export const ambientTestnetBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0xaa36a7': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [{ content: 'ambient', processAs: 'text' }],
        },
        // scroll sepolia
        '0x8274f': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: scrollLogo, processAs: 'image' },
            ],
        },
        // blast sepolia
        '0xa0c71fd': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: blastLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'ambient',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

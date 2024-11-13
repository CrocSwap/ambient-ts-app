import { brandIF } from './types';
import large from '../images/logos/large.svg';
// import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';
import plumeLogo from '../../assets/images/logos/plume_brand_logo.svg';

export const ambientTestnetBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0xaa36a7': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [{ content: 'ambient', processAs: 'text' }],
        },
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
        // blast sepolia
        '0xa0c71fd': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: blastLogo, processAs: 'image' },
            ],
        },
        // scroll sepolia
        // '0x8274f': {
        //     // first value in array is default color scheme
        //     color: ['purple_dark', 'purple_light', 'futa_dark'],
        //     premiumColor: [],
        //     hero: [
        //         { content: 'ambient', processAs: 'text' },
        //         { content: '×', processAs: 'separator' },
        //         { content: scrollLogo, processAs: 'image' },
        //     ],
        // },
    },
    platformName: 'ambient',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

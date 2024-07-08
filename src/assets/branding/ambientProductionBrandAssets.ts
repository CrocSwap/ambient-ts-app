import { brandIF } from './types';
import large from '../images/logos/large.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';
// import baseLogo from '../../assets/images/logos/base_logo.svg';

export const ambientProductionBrandAssets: brandIF = {
    networks: {
        // ethereum mainnet
        '0x1': {
            color: 'purple_dark',
            hero: [{ content: 'ambient', processAs: 'text' }],
        },
        // scroll mainnet
        '0x82750': {
            color: 'purple_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: scrollLogo, processAs: 'image' },
            ],
        },
        // blast mainnet
        '0x13e31': {
            color: 'purple_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: blastLogo, processAs: 'image' },
            ],
        },
        // base mainnet
        // '0x2105': {
        //     color: 'purple_dark',
        //     hero: [
        //         { content: 'ambient', processAs: 'text' },
        //         { content: '×', processAs: 'separator' },
        //         { content: baseLogo, processAs: 'image' },
        //     ],
        // },
    },
    platformName: 'ambient',
    fontSet: 'ambient',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: true,
};

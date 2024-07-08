import { brandIF } from './types';
import large from '../images/logos/large.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';
import baseLogo from '../../assets/images/logos/base_logo.svg';

export const defaultBrandAssets: brandIF = {
    networks: {
        // ethereum mainnet
        '0x1': {
            color: 'purple_dark',
            hero: [{ content: 'ambient', processAs: 'text' }],
        },
        // ethereum sepolia
        '0xaa36a7': {
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
        // scroll sepolia
        '0x8274f': {
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
        // blast sepolia
        '0xa0c71fd': {
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
        // base sepolia
        '0x14a34': {
            color: 'purple_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: baseLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'ambient',
    fontSet: 'ambient',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: true,
};

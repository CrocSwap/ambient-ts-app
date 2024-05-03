import { brandIF } from './types';
import large from '../images/logos/large.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';

// export const scrollBrandAssets: brandAssetsIF = {
//     networks: [
//         '0x82750', // scroll
//     ],
//     color: {
//         '0x1': 'purple_dark',
//         '0x82750': 'purple_dark',
//         '0x5': 'purple_dark',
//         '0x8274f': 'purple_dark',
//         '0xaa36a7': 'purple_dark',
//         '0xa0c71fd': 'purple_dark',
//         '0x13e31': 'purple_dark',
//     },
//     platformName: '',
//     headerImage: large as string,
//     showPoints: true,
//     showDexStats: true,
// };

export const scrollBrandAssets: brandIF = {
    networks: {
        // scroll mainnet
        '0x82750': {
            color: 'orange_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: scrollLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'futa',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
};

import { brandIF } from './types';
import large from '../images/logos/large.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';

// export const futaBrandAssets: brandAssetsIF = {
//     networks: [
//         '0xaa36a7', // ethereum sepolia
//     ],
//     color: {
//         '0x1': 'orange_dark',
//         '0x82750': 'orange_dark',
//         '0x5': 'orange_dark',
//         '0x8274f': 'orange_dark', // scroll sepolia
//         '0xaa36a7': 'orange_dark', // ethereum sepolia
//         '0xa0c71fd': 'orange_dark',
//         '0x13e31': 'orange_dark',
//     },
//     platformName: 'futa',
//     headerImage: large as string,
//     showPoints: true,
//     showDexStats: true,
//     hero: {
//         '0xaa36a7': ['futa', scrollLogo],
//     },
// };

export const futaBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0xaa36a7': {
            color: 'orange_dark',
            hero: [{ content: 'futa', processAs: 'text' }],
        },
    },
    platformName: 'futa',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
};

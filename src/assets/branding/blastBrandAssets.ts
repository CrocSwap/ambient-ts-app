import { brandIF } from './types';
import large from '../images/logos/large.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';

// export const blastBrandAssets: brandAssetsIF = {
//     networks: [
//         '0x13e31', // blast
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

export const blastBrandAssets: brandIF = {
    networks: {
        '0x13e31': {
            color: 'purple_dark',
            hero: ['blast', blastLogo],
        },
    },
    platformName: 'blast',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
};

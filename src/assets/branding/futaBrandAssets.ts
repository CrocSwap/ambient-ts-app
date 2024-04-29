import { brandAssetsIF } from './types';
import large from '../images/logos/large.svg';

export const futaBrandAssets: brandAssetsIF = {
    networks: [
        '0x8274f', // scroll sepolia
    ],
    color: {
        '0x1': 'orange_dark',
        '0x82750': 'orange_dark',
        '0x5': 'orange_dark',
        '0x8274f': 'orange_dark', // scroll sepolia
        '0xaa36a7': 'orange_dark', // ethereum sepolia
        '0xa0c71fd': 'orange_dark',
        '0x13e31': 'orange_dark',
    },
    platformName: 'futa',
    headerImage: large as string,
    showPoints: true,
    showDexStats: true,
    heroImage: 'futa',
};

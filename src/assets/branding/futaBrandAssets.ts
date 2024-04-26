import { brandAssetsIF } from './types';
import large from '../images/logos/large.svg';

export const futaBrandAssets: brandAssetsIF = {
    networks: [
        '0xaa36a7', // sepolia
    ],
    color: {
        '0x1': 'orange',
        '0x82750': 'orange',
        '0x5': 'orange',
        '0x8274f': 'orange',
        '0xaa36a7': 'orange',
        '0xa0c71fd': 'orange',
        '0x13e31': 'orange',
    },
    platformName: 'futa',
    headerImage: large as string,
    showPoints: true,
    showDexStats: true,
    heroImage: 'futa',
};

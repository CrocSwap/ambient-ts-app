import { brandAssetsIF } from './types';
import large from '../images/logos/large.svg';

export const scrollBrandAssets: brandAssetsIF = {
    networks: ['0x82750'],
    color: {
        '0x1': 'orange',
        '0x82750': 'orange',
        '0x5': 'orange',
        '0x8274f': 'orange',
        '0xaa36a7': 'orange',
        '0xa0c71fd': 'orange',
        '0x13e31': 'orange',
    },
    platformName: '',
    headerImage: large as string,
    showPoints: true,
    showDexStats: true,
};

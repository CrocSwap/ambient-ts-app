import { brandIF } from './types';
import large from '../images/logos/large.svg';

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

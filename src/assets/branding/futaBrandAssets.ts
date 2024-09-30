import { brandIF } from './types';
import large from '../images/logos/large.svg';

export const futaBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0xaa36a7': {
            color: ['futa_dark', 'purple_dark', 'purple_light'],
            premiumColor: [],
            hero: [{ content: 'futa', processAs: 'text' }],
        },
    },
    platformName: 'futa',
    fontSet: 'futa',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};

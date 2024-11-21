import { brandIF } from './types';
import pageHeaderTestBanner from '../../assets/images/Temporary/pageHeaderTestBanner.png';

export const sampleBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0x1': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [{ content: 'futa', processAs: 'text' }],
        },
    },
    platformName: 'futa',
    fontSet: 'futa',
    showPoints: false,
    showDexStats: false,
    headerImage: pageHeaderTestBanner as string,
    includeCanto: false,
};

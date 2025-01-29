import pageHeaderTestBanner from '../../assets/images/Temporary/pageHeaderTestBanner.png';
import { brandIF } from './types';

export const sampleBrandAssets: brandIF = {
    networks: {
        // ethereum sepolia
        '0x1': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
        },
    },
    platformName: 'futa',
    fontSet: 'futa',
    showPoints: false,
    showDexStats: false,
    headerImage: pageHeaderTestBanner as string,
    includeCanto: false,
};

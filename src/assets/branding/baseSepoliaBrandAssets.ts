import baseLogo from '../../assets/images/logos/Base_Wordmark_White.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const baseSepoliaBrandAssets: brandIF = {
    networks: {
        // base sepolia
        '0x14a34': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: baseLogo,
        },
    },
    platformName: 'baseSepolia',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};

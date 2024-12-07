import plumeLogo from '../../assets/images/logos/plume_brand_logo.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const plumeSepoliaBrandAssets: brandIF = {
    networks: {
        // plume sepolia
        '0x18230': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: plumeLogo,
        },
    },
    platformName: 'plumeSepolia',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};

import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const scrollBrandAssets: brandIF = {
    networks: {
        // scroll mainnet
        '0x82750': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: scrollLogo,
        },
    },
    platformName: 'scroll',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

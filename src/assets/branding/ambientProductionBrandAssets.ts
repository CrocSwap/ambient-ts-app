import blastLogo from '../../assets/images/logos/blast_logo.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const ambientProductionBrandAssets: brandIF = {
    networks: {
        // scroll mainnet
        '0x82750': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: scrollLogo,
        },
        // blast mainnet
        '0x13e31': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: blastLogo,
        },
        // ethereum mainnet
        '0x1': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
        },
    },
    platformName: 'ambient',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: true,
};

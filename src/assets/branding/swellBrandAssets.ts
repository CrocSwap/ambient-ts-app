import swellLogo from '../../assets/images/logos/swell_dark_theme_logo.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const swellBrandAssets: brandIF = {
    networks: {
        // swell mainnet
        '0x783': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: swellLogo,
        },
    },
    platformName: 'swell',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

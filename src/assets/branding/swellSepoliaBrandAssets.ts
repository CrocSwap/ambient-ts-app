import swellLogo from '../../assets/images/logos/swell_dark_theme_logo.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const swellSepoliaBrandAssets: brandIF = {
    networks: {
        // swell sepolia
        '0x784': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: swellLogo,
        },
    },
    platformName: 'swellSepolia',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};

import blastLogo from '../../assets/images/logos/blast_logo.svg';
import large from '../images/logos/large.svg';
import { brandIF } from './types';

export const blastBrandAssets: brandIF = {
    networks: {
        '0x13e31': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: blastLogo,
        },
    },
    platformName: 'blast',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

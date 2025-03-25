import baseLogo from '../../assets/images/logos/Base_Wordmark_White.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';
import monadLogo from '../../assets/images/logos/monad_full_logo.svg';
import plumeLogo from '../../assets/images/logos/plume_brand_logo.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';
import swellLogo from '../../assets/images/logos/swell_dark_theme_logo.svg';
import large from '../images/logos/ambient_logo_large.svg';
import { brandIF } from './types';

export const defaultBrandAssets: brandIF = {
    networks: {
        // ethereum mainnet
        '0x1': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
        },
        // scroll mainnet
        '0x82750': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: scrollLogo,
        },
        // swell mainnet
        '0x783': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: swellLogo,
        },
        // plume mainnet
        '0x18232': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: plumeLogo,
        },
        // plume mainnet
        '0x18231': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: plumeLogo,
        },
        // blast mainnet
        '0x13e31': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: blastLogo,
        },
        // ethereum sepolia
        '0xaa36a7': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
        },
        '0x279f': {
            // monad testnet
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: monadLogo,
        },
        // plume sepolia
        '0x18230': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: plumeLogo,
        },
        // scroll sepolia
        '0x8274f': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: scrollLogo,
        },
        // swell sepolia
        '0x784': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: swellLogo,
        },
        // base sepolia
        '0x14a34': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: baseLogo,
        },
        // blast sepolia
        '0xa0c71fd': {
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            cobrandingLogo: blastLogo,
        },
    },
    platformName: 'ambient',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: true,
};

import { brandIF } from './types';
import large from '../images/logos/large.svg';
import swellLogo from '../../assets/images/logos/swell_dark_theme_logo.svg';

export const swellSepoliaBrandAssets: brandIF = {
    networks: {
        // swell sepolia
        '0x784': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: swellLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'swellSepolia',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: false,
    headerImage: large as string,
    includeCanto: false,
};

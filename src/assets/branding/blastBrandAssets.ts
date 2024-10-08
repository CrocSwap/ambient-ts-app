import { brandIF } from './types';
import large from '../images/logos/large.svg';
import blastLogo from '../../assets/images/logos/blast_logo.svg';

export const blastBrandAssets: brandIF = {
    networks: {
        '0x13e31': {
            // first value in array is default color scheme
            color: ['purple_dark', 'purple_light', 'futa_dark'],
            premiumColor: [],
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: blastLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'blast',
    fontSet: 'ambient',
    showPoints: false,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

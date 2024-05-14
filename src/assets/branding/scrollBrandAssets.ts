import { brandIF } from './types';
import large from '../images/logos/large.svg';
import scrollLogo from '../../assets/images/logos/scroll_brand_logo.svg';

export const scrollBrandAssets: brandIF = {
    networks: {
        // scroll mainnet
        '0x82750': {
            color: 'purple_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: scrollLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'scroll',
    fontSet: 'ambient',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

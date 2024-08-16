import { brandIF } from './types';
import large from '../images/logos/large.svg';
import zircuitLogo from '../../assets/images/logos/zircuit-light-logo.svg';

export const zircuitBrandAssets: brandIF = {
    networks: {
        // zircuit mainnet
        '0xbf04': {
            color: 'purple_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: zircuitLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'zircuit',
    fontSet: 'ambient',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

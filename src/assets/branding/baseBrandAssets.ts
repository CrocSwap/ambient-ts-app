import { brandIF } from './types';
import large from '../images/logos/large.svg';
import baseLogo from '../../assets/images/logos/base_logo.svg';

export const baseBrandAssets: brandIF = {
    networks: {
        // base mainnet
        '0x2105': {
            color: 'purple_dark',
            hero: [
                { content: 'ambient', processAs: 'text' },
                { content: '×', processAs: 'separator' },
                { content: baseLogo, processAs: 'image' },
            ],
        },
    },
    platformName: 'base',
    fontSet: 'ambient',
    showPoints: true,
    showDexStats: true,
    headerImage: large as string,
    includeCanto: false,
};

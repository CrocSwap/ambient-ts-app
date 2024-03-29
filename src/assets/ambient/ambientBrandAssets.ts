import { chainIds } from '../../ambient-utils/types';
import { skins } from '../../App/hooks/useSkin';

export type chainColorScheme = Record<chainIds, skins>;

export interface brandAssetsIF {
    color: chainColorScheme;
    platformName: string;
}

export const ambientBrandAssets: brandAssetsIF = {
    color: {
        '0x1': 'purple_dark',
        '0x82750': 'purple_dark',
        '0x5': 'purple_dark',
        '0x8274f': 'purple_dark',
        '0xaa36a7': 'purple_dark',
        '0xa0c71fd': 'purple_dark',
    },
    platformName: 'ambient',
};

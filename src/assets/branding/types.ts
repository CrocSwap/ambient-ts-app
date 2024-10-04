import { chainIds } from '../../ambient-utils/types';
import { skins } from '../../App/hooks/useSkin';

export interface heroItem {
    content: string;
    processAs: 'text' | 'image' | 'separator';
}

export type fontSets = 'ambient' | 'futa';

export type networkPrefs = Partial<
    Record<
        chainIds,
        {
            color: skins[];
            premiumColor: skins[];
            hero: heroItem[];
        }
    >
>;

export interface brandIF {
    networks: networkPrefs;
    fontSet: fontSets;
    platformName: string;
    showPoints: boolean;
    showDexStats: boolean;
    headerImage: string;
    includeCanto: boolean;
}

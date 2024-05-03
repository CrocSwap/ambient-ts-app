import { chainIds } from '../../ambient-utils/types';
import { skins } from '../../App/hooks/useSkin';

// export type chainColorScheme = Record<chainIds, skins>;

// export interface brandAssetsIF {
//     networks: chainIds[];
//     color: chainColorScheme;
//     platformName: string;
//     headerImage: string;
//     showPoints: boolean;
//     showDexStats: boolean;
//     hero?: Partial<Record<chainIds, [any, any]>>;
// }

// export interface networkPrefsIF {
//     color: skins;
//     hero: [string, string];
// }

export type networkPrefs = Partial<
    Record<
        chainIds,
        {
            color: skins;
            hero: [string, string];
        }
    >
>;

export interface brandIF {
    networks: networkPrefs;
    platformName: string;
    showPoints: boolean;
    showDexStats: boolean;
    headerImage: string;
}

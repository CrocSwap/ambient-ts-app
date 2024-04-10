import { chainIds } from '../../ambient-utils/types';
import { skins } from '../../App/hooks/useSkin';

export type chainColorScheme = Record<chainIds, skins>;

export interface brandAssetsIF {
    networks: chainIds[];
    color: chainColorScheme;
    platformName: string;
    headerImage: string;
    showPoints: boolean;
    showDexStats: boolean;
}

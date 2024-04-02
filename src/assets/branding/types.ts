import { chainIds } from '../../ambient-utils/types';
import { skins } from '../../App/hooks/useSkin';

export type chainColorScheme = Record<chainIds, skins>;

export interface brandAssetsIF {
    color: chainColorScheme;
    platformName: string;
}

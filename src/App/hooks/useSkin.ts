import { useEffect, useMemo, useState } from 'react';
import { chainIds } from '../../ambient-utils/types';
import { brandAssetsIF, chainColorScheme } from '../../assets/branding/types';
import { ambientBrandAssets } from '../../assets/branding/ambientBrandAssets';
import { crocswapBrandAssets } from '../../assets/branding/crocswapBrandAssets';

export type skins = 'purple_dark' | 'purple_light' | 'orange';

export interface skinMethodsIF {
    active: skins;
    changeTo: (s: skins) => void;
}

export const useSkin = (
    colorSchemes: chainColorScheme,
    chainId: chainIds,
): skinMethodsIF => {
    const LS_KEY = 'skin';

    const FALLBACK_SET = 'ambient';
    const brand: string = process.env.REACT_APP_BRAND_ASSET_SET ?? FALLBACK_SET;
    console.log(brand);

    const brandAssets: brandAssetsIF = useMemo(() => {
        switch (brand) {
            case 'crocswap':
                return crocswapBrandAssets;
            default:
            case 'ambient':
                return ambientBrandAssets;
        }
    }, [brand]);
    console.log(brandAssets);

    const defaultColorForChain: skins = brandAssets.color[chainId];

    // name of the current skin in use by the app
    // defaults to value in local storage, uses value from params as fallback
    const [skin, setSkin] = useState<skins>(
        // localStorage[LS_KEY] ??
        defaultColorForChain,
    );

    // hook to hold a single color set for the app to return
    // updates local storage when needed as an accessory function
    useEffect(() => {
        localStorage.setItem(LS_KEY, skin);
    }, [skin]);

    return useMemo(
        () => ({
            active: skin,
            changeTo: (s: skins) => setSkin(s),
        }),
        [skin],
    );
};

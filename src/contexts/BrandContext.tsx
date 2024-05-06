import React, { createContext, useContext, useMemo } from 'react';
import { skins } from '../App/hooks/useSkin';
import { brandIF, heroItem } from '../assets/branding/types';
import { TradeDataContext } from './TradeDataContext';
import { chainIds } from '../ambient-utils/types';
import {
    blastBrandAssets,
    scrollBrandAssets,
    defaultBrandAssets,
    ambientProductionBrandAssets,
    ambientTestnetBrandAssets,
    futaBrandAssets,
} from '../assets/branding';

interface BrandContextIF {
    skin: skins;
    platformName: string;
    networks: chainIds[];
    headerImage: string;
    showPoints: boolean;
    showDexStats: boolean;
    hero: heroItem[];
}

export const BrandContext = createContext<BrandContextIF>({} as BrandContextIF);

export const BrandContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(TradeDataContext);

    // brand asset set to consume as specified in environmental variable
    // can also provide a fallback if a custom brand is missing values

    // TODO: add error handling if dev puts a value in `.env` not matching defined cases
    const FALLBACK_SET = 'ambient';
    const brand: string = process.env.REACT_APP_BRAND_ASSET_SET ?? FALLBACK_SET;
    const brandAssets = useMemo<brandIF>(() => {
        switch (brand) {
            case 'blast':
                return blastBrandAssets;
            case 'scroll':
                return scrollBrandAssets;
            case 'futa':
                return futaBrandAssets;
            case 'ambientProduction':
                return ambientProductionBrandAssets;
            case 'ambientTestnet':
                return ambientTestnetBrandAssets;
            default:
                return defaultBrandAssets;
        }
    }, [brand]);

    // hook to manage the active color theme in the app
    // const skin: skinMethodsIF = useSkin(
    //     brandAssets.color,
    //     chainData.chainId as chainIds,
    // );

    function getSkin(): skins {
        const networkPrefs =
            brandAssets.networks[chainData.chainId as chainIds];
        return networkPrefs ? networkPrefs.color : 'purple_dark';
    }

    function getHero(): heroItem[] {
        const networkPrefs =
            brandAssets.networks[chainData.chainId as chainIds];
        return networkPrefs
            ? networkPrefs.hero
            : [{ content: 'ambient', processAs: 'separator' }];
    }

    // data to be returned to the app
    const brandData: BrandContextIF = {
        skin: getSkin(),
        platformName: brandAssets.platformName,
        networks: Object.keys(brandAssets.networks) as chainIds[],
        headerImage: brandAssets.headerImage,
        showPoints: brandAssets.showPoints,
        showDexStats: brandAssets.showDexStats,
        hero: getHero(),
    };

    return (
        <BrandContext.Provider value={brandData}>
            {props.children}
        </BrandContext.Provider>
    );
};

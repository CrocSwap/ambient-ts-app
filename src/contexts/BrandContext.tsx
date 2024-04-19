import React, { createContext, useContext, useMemo } from 'react';
import { skinMethodsIF, useSkin } from '../App/hooks/useSkin';
import { crocswapBrandAssets } from '../assets/branding/crocswapBrandAssets';
import { brandAssetsIF } from '../assets/branding/types';
import { TradeDataContext } from './TradeDataContext';
import { chainIds } from '../ambient-utils/types';
import {
    blastBrandAssets,
    scrollBrandAssets,
    ambientBrandAssets,
} from '../assets/branding';

interface BrandContextIF {
    skin: skinMethodsIF;
    platformName: string;
    networks: chainIds[];
    headerImage: string;
    showPoints: boolean;
    showDexStats: boolean;
}

export const BrandContext = createContext<BrandContextIF>({} as BrandContextIF);

export const BrandContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(TradeDataContext);

    // brand asset set to consume as specified in environmental variable
    // can also provide a fallback if a custom brand is missing values

    // TODO: add error handling if dev puts a value in `.env` not matching defined cases
    const FALLBACK_SET = 'ambient';
    const brand: string = process.env.REACT_APP_BRAND_ASSET_SET ?? FALLBACK_SET;
    const brandAssets = useMemo<brandAssetsIF>(() => {
        switch (brand) {
            case 'crocswap':
                return crocswapBrandAssets;
            case 'blast':
                return blastBrandAssets;
            case 'scroll':
                return scrollBrandAssets;
            case 'ambient':
            default:
                return ambientBrandAssets;
        }
    }, [brand]);

    // hook to manage the active color theme in the app
    const skin: skinMethodsIF = useSkin(
        blastBrandAssets.color,
        chainData.chainId as chainIds,
    );

    // data to be returned to the app
    const brandData: BrandContextIF = {
        skin,
        platformName: brandAssets.platformName,
        networks: brandAssets.networks,
        headerImage: brandAssets.headerImage,
        showPoints: brandAssets.showPoints,
        showDexStats: brandAssets.showDexStats,
    };

    console.log(brandData);

    return (
        <BrandContext.Provider value={brandData}>
            {props.children}
        </BrandContext.Provider>
    );
};

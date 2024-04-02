import React, { createContext, useContext, useMemo } from 'react';
import { skinMethodsIF, useSkin } from '../App/hooks/useSkin';
import { ambientBrandAssets } from '../assets/branding/ambientBrandAssets';
import { crocswapBrandAssets } from '../assets/branding/crocswapBrandAssets';
import { brandAssetsIF } from '../assets/branding/types';
import { TradeDataContext } from './TradeDataContext';

interface BrandContextIF {
    skin: skinMethodsIF;
    platformName: string;
}

export const BrandContext = createContext<BrandContextIF>({} as BrandContextIF);

export const BrandContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(TradeDataContext);

    // brand asset set to consume as specified in environmental variable
    // can also provide a fallback if a custom brand is missing values
    const FALLBACK_SET = 'ambient';
    const brand: string = process.env.REACT_APP_BRAND_ASSET_SET ?? FALLBACK_SET;
    const brandAssets = useMemo<brandAssetsIF>(() => {
        switch (brand) {
            case 'crocswap':
                return crocswapBrandAssets;
            case 'ambient':
            default:
                return ambientBrandAssets;
        }
    }, [brand]);

    // hook to manage the active color theme in the app
    const skin: skinMethodsIF = useSkin(
        brandAssets.color,
        chainData.chainId ?? '0x1',
    );

    // data to be returned to the app
    const brandData: BrandContextIF = {
        skin,
        platformName: brandAssets.platformName,
    };

    return (
        <BrandContext.Provider value={brandData}>
            {props.children}
        </BrandContext.Provider>
    );
};

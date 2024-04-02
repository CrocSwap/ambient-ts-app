import React, { createContext, useContext, useMemo } from 'react';
import { CrocEnvContext } from './CrocEnvContext';
import { skinMethodsIF, useSkin } from '../App/hooks/useSkin';
import { chainIds } from '../ambient-utils/types';
import { ambientBrandAssets } from '../assets/branding/ambientBrandAssets';
import { crocswapBrandAssets } from '../assets/branding/crocswapBrandAssets';
import { brandAssetsIF } from '../assets/branding/types';

interface BrandContextIF {
    skin: skinMethodsIF;
}

export const BrandContext = createContext<BrandContextIF>({} as BrandContextIF);

export const BrandContextProvider = (props: { children: React.ReactNode }) => {
    const { chainData } = useContext(CrocEnvContext);

    // brand asset set to consume as specified in environmental variable
    // can also provide a fallback if a custom brand is missing values
    const FALLBACK_SET = 'ambient';
    const brand: string = process.env.REACT_APP_BRAND_ASSET_SET ?? FALLBACK_SET;
    const brandAssets: brandAssetsIF = useMemo<brandAssetsIF>(() => {
        switch (brand) {
            case 'crocswap':
                return crocswapBrandAssets;
            default:
            case 'ambient':
                return ambientBrandAssets;
        }
    }, [brand]);

    // hook to manage the active color theme in the app
    const skin: skinMethodsIF = useSkin(
        brandAssets.color,
        chainData.chainId as chainIds,
    );

    // data to be returned to the app
    const brandData: BrandContextIF = {
        skin,
    };

    return (
        <BrandContext.Provider value={brandData}>
            {props.children}
        </BrandContext.Provider>
    );
};

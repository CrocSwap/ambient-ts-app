import React, { createContext, useContext } from 'react';
import { CrocEnvContext } from './CrocEnvContext';
import { skinMethodsIF, useSkin } from '../App/hooks/useSkin';
import { chainIds } from '../ambient-utils/types';

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

    // hook to manage the active color theme in the app
    const skin: skinMethodsIF = useSkin(chainData.chainId as chainIds);

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

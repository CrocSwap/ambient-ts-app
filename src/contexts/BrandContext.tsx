import React, { createContext, useContext } from 'react';
import { CrocEnvContext } from './CrocEnvContext';
import { skinMethodsIF, useSkin } from '../App/hooks/useSkin';
import { chainIds } from '../ambient-utils/types';

interface BrandContextIF {
    skin: skinMethodsIF;
}

export const BrandContext = createContext<BrandContextIF>({} as BrandContextIF);

// TODO: refactor to cache in context and use other contexts as dependencies
export const CachedDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { chainData } = useContext(CrocEnvContext);
    const skin: skinMethodsIF = useSkin(chainData.chainId as chainIds);

    const brandData: BrandContextIF = {
        skin,
    };

    return (
        <BrandContext.Provider value={brandData}>
            {props.children}
        </BrandContext.Provider>
    );
};

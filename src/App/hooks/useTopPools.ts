import { TokenIF } from '../../utils/interfaces/exports';
import { topPools } from '../mockData';

interface topPoolIF {
    name: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolId: number;
    speed: number;
    id: number;
}

export interface topPoolsMethodsIF {
    all: topPoolIF[];
};

export const useTopPools = (): topPoolsMethodsIF => {
    console.log({topPools});

    return {
        all: topPools
    };
};
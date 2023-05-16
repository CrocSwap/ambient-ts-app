import { CrocPoolView } from '@crocswap-libs/sdk';
import { createContext } from 'react';

interface PoolIF {
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean;
    poolPriceChangePercent: string | undefined;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
}

export const PoolContext = createContext<PoolIF>({} as PoolIF);

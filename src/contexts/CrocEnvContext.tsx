import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { createContext } from 'react';
import { topPoolIF } from '../App/hooks/useTopPools';

interface CrocEnvIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv) => void;
    chainData: ChainSpec;
    isChainSupported: boolean;
    topPools: topPoolIF[];
    ethMainnetUsdPrice: number | undefined;
    setEthMainnetUsdPrice: (val: number) => void;
}

export const CrocEnvContext = createContext<CrocEnvIF>({} as CrocEnvIF);

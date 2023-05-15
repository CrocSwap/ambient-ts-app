import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { createContext } from 'react';
import { topPoolIF } from '../App/hooks/useTopPools';
import { TokenIF } from '../utils/interfaces/TokenIF';

interface CrocEnvIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv) => void;
    chainData: ChainSpec;
    isChainSupported: boolean;
    topPools: topPoolIF[];
    tokensOnActiveLists: Map<string, TokenIF>;
    ethMainnetUsdPrice: number | undefined;
    setEthMainnetUsdPrice: (val: number) => void;
}

export const CrocEnvContext = createContext<CrocEnvIF>({} as CrocEnvIF);

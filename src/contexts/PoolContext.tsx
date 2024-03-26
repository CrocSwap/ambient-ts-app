import { CrocPoolView } from '@crocswap-libs/sdk';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { estimateFrom24HrAmbientApr } from '../ambient-utils/api';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';
import { usePoolList } from '../App/hooks/usePoolList';
import { PoolIF, PoolStatIF, TokenIF } from '../ambient-utils/types';
import useFetchPoolStats from '../App/hooks/useFetchPoolStats';
import { TradeDataContext } from './TradeDataContext';
import { isWethToken } from '../ambient-utils/dataLayer';

interface PoolContextIF {
    poolList: PoolIF[];
    findPool: (
        tkn1: TokenIF | string,
        tkn2?: TokenIF | string,
    ) => PoolIF | undefined;
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean;
    poolPriceChangePercent: string | undefined;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
    poolData: PoolStatIF;
}

export const PoolContext = createContext<PoolContextIF>({} as PoolContextIF);

export const PoolContextProvider = (props: { children: React.ReactNode }) => {
    const { crocEnv, provider, chainData, activeNetwork } =
        useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);
    const poolList: PoolIF[] = usePoolList(
        activeNetwork.graphCacheUrl,
        crocEnv,
    );

    // fn to determine if a given token pair exists in `poolList`
    function findPool(
        tkn1: TokenIF | string,
        tkn2?: TokenIF | string,
    ): PoolIF | undefined {
        // handle multiple input types
        function fixAddress(t: TokenIF | string): string {
            const addr: string = typeof t === 'string' ? t : t.address;
            return addr.toLowerCase();
        }
        const tkn1Addr: string = fixAddress(tkn1);
        // output variable
        let pool: PoolIF | undefined;
        // if called on two tokens, find first pool with both addresses
        // if called on one token, find first pool including that token
        if (tkn2) {
            // fix capitalization on input addresses
            const tkn2Addr: string = fixAddress(tkn2);
            // search `poolList` for a pool with the both tokens from params
            pool = poolList.find((p: PoolIF) => {
                const baseAddr: string = p.base.address.toLowerCase();
                const quoteAddr: string = p.quote.address.toLowerCase();
                const isMatch: boolean =
                    (baseAddr === tkn1Addr && quoteAddr === tkn2Addr) ||
                    (baseAddr === tkn2Addr && quoteAddr === tkn1Addr);
                return isMatch;
            });
        } else {
            // search `poolList` for a pool with the token from params
            pool = poolList.find((p: PoolIF) => {
                const baseAddr: string = p.base.address.toLowerCase();
                const quoteAddr: string = p.quote.address.toLowerCase();
                const isMatch: boolean =
                    (baseAddr === tkn1Addr && !isWethToken(quoteAddr)) ||
                    (quoteAddr === tkn1Addr && !isWethToken(baseAddr));
                return isMatch;
            });
        }
        // return output variable
        return pool;
    }

    const pool = useMemo(
        () => crocEnv?.pool(baseToken.address, quoteToken.address),
        [crocEnv, baseToken.address, quoteToken.address],
    );

    const poolArg: PoolIF = {
        base: baseToken,
        quote: quoteToken,
        chainId: chainData.chainId,
        poolIdx: chainData.poolIndex,
    };

    const poolData = useFetchPoolStats(poolArg, true);

    const [ambientApy, setAmbientApy] = useState<number | undefined>();
    const [dailyVol] = useState<number | undefined>();

    const poolPriceDisplay = poolData.poolPriceDisplay;
    const isPoolPriceChangePositive = poolData.isPoolPriceChangePositive;
    const poolPriceChangePercent = poolData.poolPriceChangePercent;
    const isPoolInitialized = poolData.isPoolInitialized;

    // Asynchronously query the APY and volatility estimates from the backend
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                provider &&
                baseTokenAddress &&
                quoteTokenAddress &&
                lastBlockNumber > 0
            ) {
                const annualizedGrowth = estimateFrom24HrAmbientApr(
                    baseTokenAddress,
                    quoteTokenAddress,
                    crocEnv,
                    provider,
                    lastBlockNumber,
                );

                setAmbientApy(await annualizedGrowth);
            }
        })();
    }, [
        lastBlockNumber == 0,
        baseTokenAddress,
        quoteTokenAddress,
        chainData.chainId,
        chainData.poolIndex,
        !!crocEnv,
        !!provider,
    ]);

    const poolContext = {
        poolList,
        findPool,
        pool,
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        ambientApy,
        dailyVol,
        poolData,
    };

    return (
        <PoolContext.Provider value={poolContext}>
            {props.children}
        </PoolContext.Provider>
    );
};

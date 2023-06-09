import { CrocPoolView } from '@crocswap-libs/sdk';
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useAccount } from 'wagmi';
import { usePoolPricing } from '../App/hooks/usePoolPricing';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { AppStateContext } from './AppStateContext';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';

interface PoolContextIF {
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean;
    poolPriceChangePercent: string | undefined;
    ambientApy: number | undefined;
    dailyVol: number | undefined;
}

export const PoolContext = createContext<PoolContextIF>({} as PoolContextIF);

export const PoolContextProvider = (props: { children: React.ReactNode }) => {
    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { cachedQuerySpotPrice } = useContext(CachedDataContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        baseToken: { address: baseTokenAddress, decimals: baseTokenDecimals },
        quoteToken: {
            address: quoteTokenAddress,
            decimals: quoteTokenDecimals,
        },
    } = useContext(TradeTokenContext);

    const { tradeData, receiptData, userData } = useAppSelector(
        (state) => state,
    );
    const { isConnected } = useAccount();

    const pool = useMemo(
        () =>
            crocEnv?.pool(
                tradeData.baseToken.address,
                tradeData.quoteToken.address,
            ),
        [crocEnv, tradeData.baseToken.address, tradeData.quoteToken.address],
    );

    const [ambientApy, setAmbientApy] = useState<number | undefined>();
    const [dailyVol] = useState<number | undefined>();

    const {
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
    } = usePoolPricing({
        crocEnv,
        pathname: location.pathname,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        chainData,
        receiptCount: receiptData.sessionReceipts.length,
        isUserLoggedIn: isConnected,
        isUserIdle: userData.isUserIdle,
        lastBlockNumber,
        isServerEnabled,
        cachedQuerySpotPrice,
    });

    const poolContext = {
        pool,
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        ambientApy,
        dailyVol,
    };

    // Approximately 24 hours in Ethereum. TODO make this generalizable across
    // chains.
    const FIXED_APY_N_BLOCK_LOOKBACK = 7000;

    // Asynchronously query the APY and volatility estimates from the backend
    useEffect(() => {
        (async () => {
            const provider = (await crocEnv?.context)?.provider;
            if (
                crocEnv &&
                provider &&
                baseTokenAddress &&
                quoteTokenAddress &&
                lastBlockNumber > 0
            ) {
                const lookbackBlockNum =
                    lastBlockNumber - FIXED_APY_N_BLOCK_LOOKBACK;
                const lookbackBlock = provider.getBlock(lookbackBlockNum);

                const nowGrowth = crocEnv
                    .pool(baseTokenAddress, quoteTokenAddress)
                    .cumAmbientGrowth(lastBlockNumber);
                const prevGrowth = crocEnv
                    .pool(baseTokenAddress, quoteTokenAddress)
                    .cumAmbientGrowth(lookbackBlockNum);

                const periodGrowth = (await nowGrowth) - (await prevGrowth);
                const timeSecs =
                    Date.now() / 1000 - (await lookbackBlock).timestamp;

                const timeYears = timeSecs / (365 * 24 * 3600);
                const annualizedGrowth = periodGrowth / timeYears;

                setAmbientApy(annualizedGrowth);
            }
        })();
    }, [
        lastBlockNumber == 0,
        baseTokenAddress,
        quoteTokenAddress,
        chainData.chainId,
        chainData.poolIndex,
        crocEnv,
    ]);

    return (
        <PoolContext.Provider value={poolContext}>
            {props.children}
        </PoolContext.Provider>
    );
};

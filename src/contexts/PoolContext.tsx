import { CrocPoolView } from '@crocswap-libs/sdk';
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { ZERO_ADDRESS } from '../ambient-utils/constants';
import {
    getFormattedNumber,
    isBtcPair,
    isDefaultDenomTokenExcludedFromUsdConversion,
    isETHPair,
    isStablePair,
    isWbtcOrStakedBTCToken,
} from '../ambient-utils/dataLayer';
import { PoolIF, PoolStatIF } from '../ambient-utils/types';
import useFetchPoolStats from '../App/hooks/useFetchPoolStats';
import { usePoolList } from '../App/hooks/usePoolList';
import { AppStateContext } from './AppStateContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeDataContext } from './TradeDataContext';

export interface PoolContextIF {
    analyticsPoolList: PoolIF[] | undefined;
    activePoolList: PoolIF[];
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean | undefined;
    poolPriceChangePercent: string | undefined;
    dailyVol: number | undefined;
    poolData: PoolStatIF;
    usdPrice: number | undefined;
    usdPriceInverse: number | undefined;
    isTradeDollarizationEnabled: boolean;
    isDefaultTradeDollarization: boolean;
    setIsTradeDollarizationEnabled: Dispatch<SetStateAction<boolean>>;
    fdvOfDenomTokenDisplay: string | undefined;
    baseTokenFdvDisplay: string | undefined;
    quoteTokenFdvDisplay: string | undefined;
}

export const PoolContext = createContext({} as PoolContextIF);

export const PoolContextProvider = (props: { children: ReactNode }) => {
    const {
        activeNetwork: { chainId, poolIndex },
    } = useContext(AppStateContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { gcgoPoolList } = useContext(ChainDataContext);

    const analyticsPoolList: PoolIF[] | undefined = usePoolList(crocEnv);

    const [activePoolList, setActivePoolList] = useState<PoolIF[]>(
        analyticsPoolList?.length ? analyticsPoolList : [],
    );

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (!analyticsPoolList?.length) {
            timeout = setTimeout(() => {
                if (!analyticsPoolList?.length && gcgoPoolList?.length) {
                    setActivePoolList(gcgoPoolList);
                }
            }, 2000);
        } else {
            setActivePoolList(analyticsPoolList);
        }

        return () => clearTimeout(timeout); // Cleanup on re-run or unmount
    }, [JSON.stringify(analyticsPoolList), JSON.stringify(gcgoPoolList)]);

    const { baseToken, quoteToken, isDenomBase, didUserFlipDenom } =
        useContext(TradeDataContext);

    const pool = useMemo(
        () => crocEnv?.pool(baseToken.address, quoteToken.address),
        [crocEnv, baseToken.address, quoteToken.address],
    );

    const poolArg: PoolIF = {
        baseToken,
        quoteToken,
        base: baseToken.address,
        quote: quoteToken.address,
        chainId: chainId,
        poolIdx: poolIndex,
    };

    const poolData = useFetchPoolStats(
        poolArg,
        activePoolList,
        undefined,
        true,
        true,
        didUserFlipDenom,
    );

    const [dailyVol] = useState<number | undefined>();

    const {
        poolPriceDisplay,
        poolPriceChangePercent,
        isPoolPriceChangePositive,
        basePrice,
        quotePrice,
        isPoolInitialized,
        baseFdvUsd,
        quoteFdvUsd,
    } = poolData;

    const baseTokenFdvDisplay = baseFdvUsd
        ? getFormattedNumber({ value: baseFdvUsd, prefix: '$' })
        : undefined;

    const quoteTokenFdvDisplay = quoteFdvUsd
        ? getFormattedNumber({ value: quoteFdvUsd, prefix: '$' })
        : undefined;

    const fdvOfDenomTokenDisplay = isDenomBase
        ? baseTokenFdvDisplay
        : quoteTokenFdvDisplay;

    const usdPrice = poolPriceDisplay
        ? isDenomBase
            ? quotePrice
                ? (1 / poolPriceDisplay) * quotePrice
                : undefined
            : basePrice
              ? poolPriceDisplay * basePrice
              : undefined
        : undefined;

    const usdPriceInverse = poolPriceDisplay
        ? isDenomBase
            ? basePrice
                ? poolPriceDisplay * basePrice
                : undefined
            : quotePrice
              ? (1 / poolPriceDisplay) * quotePrice
              : undefined
        : undefined;

    const [isDefaultTradeDollarization, setDefaultTradeDollarization] =
        useState(usdPrice !== undefined);

    const [isTradeDollarizationEnabled, setIsTradeDollarizationEnabled] =
        useState(usdPrice !== undefined);

    useEffect(() => {
        const isPairStablePair = isStablePair(
            baseToken.address,
            quoteToken.address,
        );
        const isPairEthPair = isETHPair(
            baseToken.address,
            quoteToken.address,
            chainId,
        );
        const isPoolBtcPair = isBtcPair(baseToken.address, quoteToken.address);

        const excludeFromUsdConversion =
            isDefaultDenomTokenExcludedFromUsdConversion(baseToken, quoteToken);

        const isPairEthWbtc =
            baseToken.address === ZERO_ADDRESS &&
            isWbtcOrStakedBTCToken(quoteToken.address);

        if (
            usdPrice !== undefined &&
            !(
                isPairStablePair ||
                isPairEthPair ||
                isPoolBtcPair ||
                isPairEthWbtc ||
                excludeFromUsdConversion
            )
        ) {
            setDefaultTradeDollarization(true);
            setIsTradeDollarizationEnabled(true);
        } else {
            setDefaultTradeDollarization(false);
            setIsTradeDollarizationEnabled(false);
        }
    }, [baseToken.address, quoteToken.address, usdPrice !== undefined]);

    const poolContext: PoolContextIF = {
        analyticsPoolList,
        activePoolList,
        pool,
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        dailyVol,
        fdvOfDenomTokenDisplay,
        baseTokenFdvDisplay,
        quoteTokenFdvDisplay,
        poolData,
        usdPrice,
        usdPriceInverse,
        isTradeDollarizationEnabled,
        isDefaultTradeDollarization,
        setIsTradeDollarizationEnabled,
    };

    return (
        <PoolContext.Provider value={poolContext}>
            {props.children}
        </PoolContext.Provider>
    );
};

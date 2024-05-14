import React, { createContext, useEffect, useMemo, useState } from 'react';
import { NetworkIF, TokenIF } from '../ambient-utils/types';
import { ChainSpec, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import {
    blastETH,
    blastUSDB,
    getDefaultPairForChain,
    mainnetETH,
} from '../ambient-utils/constants';
import { useAppChain } from '../App/hooks/useAppChain';
import { translateTokenSymbol } from '../ambient-utils/dataLayer';
import { tokenMethodsIF, useTokens } from '../App/hooks/useTokens';

export interface TradeDataContextIF {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    areDefaultTokensUpdatedForChain: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    didUserFlipDenom: boolean;
    isTokenAPrimary: boolean;
    soloToken: TokenIF;
    shouldSwapDirectionReverse: boolean;
    primaryQuantity: string;
    limitTick: number | undefined;
    poolPriceNonDisplay: number;
    currentPoolPriceTick: number;
    slippageTolerance: number;

    setTokenA: React.Dispatch<React.SetStateAction<TokenIF>>;
    setTokenB: React.Dispatch<React.SetStateAction<TokenIF>>;
    setDenomInBase: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTokenAPrimary: React.Dispatch<React.SetStateAction<boolean>>;
    setDidUserFlipDenom: React.Dispatch<React.SetStateAction<boolean>>;
    toggleDidUserFlipDenom: () => void;
    setSoloToken: React.Dispatch<React.SetStateAction<TokenIF>>;
    setShouldSwapDirectionReverse: React.Dispatch<
        React.SetStateAction<boolean>
    >;
    setPrimaryQuantity: React.Dispatch<React.SetStateAction<string>>;
    setLimitTick: React.Dispatch<React.SetStateAction<number | undefined>>;
    setPoolPriceNonDisplay: React.Dispatch<React.SetStateAction<number>>;
    setSlippageTolerance: React.Dispatch<React.SetStateAction<number>>;

    chainData: ChainSpec;
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
    defaultRangeWidthForActivePool: number;
    getDefaultRangeWidthForTokenPair: (
        chainId: string,
        baseAddress: string,
        quoteAddress: string,
    ) => number;

    noGoZoneBoundaries: number[];
    setNoGoZoneBoundaries: React.Dispatch<React.SetStateAction<number[]>>;
}

export const TradeDataContext = createContext<TradeDataContextIF>(
    {} as TradeDataContextIF,
);
// Have to set these values to something on load, so we use default pair
// for default chain. Don't worry if user is coming in to another chain,
// since these will get updated by useUrlParams() in any context where a
// pair is necessary at load time

export const TradeDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const { chainData, activeNetwork, chooseNetwork } = useAppChain();

    const savedTokenASymbol = localStorage.getItem('tokenA');
    const savedTokenBSymbol = localStorage.getItem('tokenB');

    const [dfltTokenA, dfltTokenB]: [TokenIF, TokenIF] = getDefaultPairForChain(
        chainData.chainId,
    );

    // Limit NoGoZone
    const [noGoZoneBoundaries, setNoGoZoneBoundaries] = useState([0, 0]);

    const tokens: tokenMethodsIF = useTokens(chainData.chainId, []);

    const tokensMatchingA =
        savedTokenASymbol === 'ETH'
            ? [dfltTokenA]
            : tokens.getTokensByNameOrSymbol(savedTokenASymbol || '', true);
    const tokensMatchingB =
        savedTokenBSymbol === 'ETH'
            ? [dfltTokenA]
            : tokens.getTokensByNameOrSymbol(savedTokenBSymbol || '', true);

    const firstTokenMatchingA = tokensMatchingA[0] || undefined;
    const firstTokenMatchingB = tokensMatchingB[0] || undefined;

    const isSavedTokenADefaultB = savedTokenASymbol
        ? translateTokenSymbol(savedTokenASymbol) ===
          translateTokenSymbol(dfltTokenB.symbol)
        : false;

    const isSavedTokenBDefaultA = savedTokenBSymbol
        ? translateTokenSymbol(savedTokenBSymbol) ===
          translateTokenSymbol(dfltTokenA.symbol)
        : false;

    const shouldReverseDefaultTokens =
        isSavedTokenADefaultB || isSavedTokenBDefaultA;

    const [tokenA, setTokenA] = React.useState<TokenIF>(() => {
        return firstTokenMatchingA
            ? firstTokenMatchingA
            : shouldReverseDefaultTokens
            ? dfltTokenB
            : dfltTokenA;
    });
    const [tokenB, setTokenB] = React.useState<TokenIF>(
        firstTokenMatchingB
            ? firstTokenMatchingB
            : shouldReverseDefaultTokens
            ? dfltTokenA
            : dfltTokenB,
    );

    const [
        areDefaultTokensUpdatedForChain,
        setAreDefaultTokensUpdatedForChain,
    ] = React.useState<boolean>(false);
    const [isDenomBase, setDenomInBase] = React.useState<boolean>(true);
    // TODO: this can likely be refactored out
    const [didUserFlipDenom, setDidUserFlipDenom] =
        React.useState<boolean>(false);

    const { baseToken, quoteToken, isTokenABase } = useMemo(() => {
        const [baseTokenAddress] = sortBaseQuoteTokens(
            tokenA.address,
            tokenB.address,
        );
        setAreDefaultTokensUpdatedForChain(true);

        if (tokenA.address.toLowerCase() === baseTokenAddress.toLowerCase()) {
            return {
                baseToken: tokenA,
                quoteToken: tokenB,
                isTokenABase: true,
            };
        } else {
            return {
                baseToken: tokenB,
                quoteToken: tokenA,
                isTokenABase: false,
            };
        }
    }, [tokenA, tokenB]);

    const toggleDidUserFlipDenom = () => {
        setDidUserFlipDenom(!didUserFlipDenom);
    };

    const [soloToken, setSoloToken] = React.useState(mainnetETH);

    const [shouldSwapDirectionReverse, setShouldSwapDirectionReverse] =
        React.useState(false);

    const [primaryQuantity, setPrimaryQuantity] = React.useState(
        localStorage.getItem('primaryQuantity') || '',
    );
    const [isTokenAPrimary, setIsTokenAPrimary] = React.useState<boolean>(
        localStorage.getItem('isTokenAPrimary') !== null
            ? localStorage.getItem('isTokenAPrimary') === 'true'
            : true,
    );

    useEffect(() => {
        if (isTokenAPrimary) {
            localStorage.setItem('isTokenAPrimary', 'true');
        } else {
            localStorage.setItem('isTokenAPrimary', 'false');
        }
    }, [isTokenAPrimary]);

    useEffect(() => {
        localStorage.setItem('tokenA', translateTokenSymbol(tokenA.symbol));
        localStorage.setItem('tokenB', translateTokenSymbol(tokenB.symbol));
    }, [tokenA.address, tokenB.address]);

    useEffect(() => {
        localStorage.setItem('primaryQuantity', primaryQuantity);
    }, [primaryQuantity]);

    const [limitTick, setLimitTick] = React.useState<number | undefined>(
        undefined,
    );
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = React.useState(0);

    const currentPoolPriceTick = useMemo(
        () =>
            poolPriceNonDisplay === undefined
                ? 0
                : Math.log(poolPriceNonDisplay) / Math.log(1.0001),
        [poolPriceNonDisplay],
    );

    useEffect(() => {
        setPoolPriceNonDisplay(0);
        setDidUserFlipDenom(false);
    }, [baseToken.address + quoteToken.address]);

    const [slippageTolerance, setSlippageTolerance] = React.useState(0.5);

    const getDefaultRangeWidthForTokenPair = (
        chainId: string,
        baseAddress: string,
        quoteAddress: string,
    ) => {
        const isPoolBlastEthUSDB =
            chainId === '0x13e31' &&
            baseAddress.toLowerCase() === blastETH.address.toLowerCase() &&
            quoteAddress.toLowerCase() === blastUSDB.address.toLowerCase();
        // temporarily reset to 10 for ETH/USDB until volatility reduces
        const defaultWidth = isPoolBlastEthUSDB ? 10 : 10;
        return defaultWidth;
    };

    const defaultRangeWidthForActivePool = useMemo(() => {
        const defaultWidth = getDefaultRangeWidthForTokenPair(
            chainData.chainId,
            baseToken.address,
            quoteToken.address,
        );
        return defaultWidth;
    }, [baseToken.address + quoteToken.address + chainData.chainId]);

    const tradeDataContext = {
        tokenA,
        tokenB,
        baseToken,
        quoteToken,
        isTokenABase,
        isDenomBase,
        isTokenAPrimary,
        didUserFlipDenom,
        soloToken,
        shouldSwapDirectionReverse,
        primaryQuantity,
        limitTick,
        poolPriceNonDisplay,
        currentPoolPriceTick,
        slippageTolerance,
        setTokenA,
        setTokenB,
        areDefaultTokensUpdatedForChain,
        setDenomInBase,
        setIsTokenAPrimary,
        setDidUserFlipDenom,
        toggleDidUserFlipDenom,
        setSoloToken,
        setShouldSwapDirectionReverse,
        setPrimaryQuantity,
        setLimitTick,
        setPoolPriceNonDisplay,
        setSlippageTolerance,
        chainData,
        activeNetwork,
        chooseNetwork,
        defaultRangeWidthForActivePool,
        getDefaultRangeWidthForTokenPair,
        noGoZoneBoundaries,
        setNoGoZoneBoundaries,
    };

    return (
        <TradeDataContext.Provider value={tradeDataContext}>
            {props.children}
        </TradeDataContext.Provider>
    );
};

import React, { createContext, useEffect, useMemo } from 'react';
import { NetworkIF, TokenIF } from '../ambient-utils/types';
import { ChainSpec, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import {
    blastETH,
    blastUSDB,
    getDefaultPairForChain,
    goerliETH,
} from '../ambient-utils/constants';
import { useAppChain } from '../App/hooks/useAppChain';

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
    isWalletChainSupported: boolean;
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
    defaultRangeWidthForActivePool: number;
    getDefaultRangeWidthForTokenPair: (
        chainId: string,
        baseAddress: string,
        quoteAddress: string,
    ) => number;
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
    const { chainData, isWalletChainSupported, activeNetwork, chooseNetwork } =
        useAppChain();
    // const dfltChainId = getDefaultChainId();
    const dfltTokenA = getDefaultPairForChain(chainData.chainId)[0];
    const dfltTokenB = getDefaultPairForChain(chainData.chainId)[1];
    const [tokenA, setTokenA] = React.useState<TokenIF>(dfltTokenA);
    const [tokenB, setTokenB] = React.useState<TokenIF>(dfltTokenB);
    const [
        areDefaultTokensUpdatedForChain,
        setAreDefaultTokensUpdatedForChain,
    ] = React.useState<boolean>(false);
    const [isDenomBase, setDenomInBase] = React.useState<boolean>(true);
    // TODO: this can likely be refactored out
    const [didUserFlipDenom, setDidUserFlipDenom] =
        React.useState<boolean>(false);

    // TODO: Not convinced yet this belongs here
    //  This probably belongs in a separate context
    // Belongs with the other "primary" values in the tradedata slice
    const [isTokenAPrimary, setIsTokenAPrimary] = React.useState<boolean>(true);

    const { baseToken, quoteToken, isTokenABase } = useMemo(() => {
        const [baseTokenAddress] = sortBaseQuoteTokens(
            tokenA.address,
            tokenB.address,
        );

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

    // TODO: this part feels suspicious
    // Why should we be handling the app chain in a hook
    // rather than a context?

    useEffect(() => {
        if (tokenA.chainId !== parseInt(chainData.chainId)) {
            const [_tokenA, _tokenB] = getDefaultPairForChain(
                chainData.chainId,
            );
            setTokenA(_tokenA);
            setTokenB(_tokenB);
        }
        setAreDefaultTokensUpdatedForChain(true);
    }, [chainData.chainId]);

    const [soloToken, setSoloToken] = React.useState(goerliETH);

    const [shouldSwapDirectionReverse, setShouldSwapDirectionReverse] =
        React.useState(false);
    const [primaryQuantity, setPrimaryQuantity] = React.useState('');
    const [limitTick, setLimitTick] = React.useState<number | undefined>(
        undefined,
    );
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = React.useState(0);
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
        isWalletChainSupported,
        activeNetwork,
        chooseNetwork,
        defaultRangeWidthForActivePool,
        getDefaultRangeWidthForTokenPair,
    };

    return (
        <TradeDataContext.Provider value={tradeDataContext}>
            {props.children}
        </TradeDataContext.Provider>
    );
};

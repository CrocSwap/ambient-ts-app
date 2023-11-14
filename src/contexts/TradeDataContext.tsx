import React, { createContext, useEffect, useMemo } from 'react';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import {
    getDefaultChainId,
    getDefaultPairForChain,
} from '../utils/data/chains';
import { useAppChain } from '../App/hooks/useAppChain';

export interface TradeDataContextIF {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    isTokenABase: boolean;
    isDenomBase: boolean;
    didUserFlipDenom: boolean;
    isTokenAPrimary: boolean;

    setTokenA: React.Dispatch<React.SetStateAction<TokenIF>>;
    setTokenB: React.Dispatch<React.SetStateAction<TokenIF>>;
    setDenomInBase: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTokenAPrimary: React.Dispatch<React.SetStateAction<boolean>>;
    setDidUserFlipDenom: React.Dispatch<React.SetStateAction<boolean>>;
    toggleDidUserFlipDenom: () => void;
}

export const TradeDataContext = createContext<TradeDataContextIF>(
    {} as TradeDataContextIF,
);
// Have to set these values to something on load, so we use default pair
// for default chain. Don't worry if user is coming in to another chain,
// since these will get updated by useUrlParams() in any context where a
// pair is necessary at load time
const dfltChainId = getDefaultChainId();
const dfltTokenA = getDefaultPairForChain(dfltChainId)[0];
const dfltTokenB = getDefaultPairForChain(dfltChainId)[1];

export const TradeDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [tokenA, setTokenA] = React.useState<TokenIF>(dfltTokenA);
    const [tokenB, setTokenB] = React.useState<TokenIF>(dfltTokenB);
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
    const { chainData } = useAppChain();
    useEffect(() => {
        if (tokenA.chainId !== parseInt(chainData.chainId)) {
            const [_tokenA, _tokenB] = getDefaultPairForChain(
                chainData.chainId,
            );
            setTokenA(_tokenA);
            setTokenB(_tokenB);
        }
    }, [chainData.chainId]);

    const tradeDataContext = {
        tokenA,
        tokenB,
        baseToken,
        quoteToken,
        isTokenABase,
        isDenomBase,
        isTokenAPrimary,
        didUserFlipDenom,
        setTokenA,
        setTokenB,
        setDenomInBase,
        setIsTokenAPrimary,
        setDidUserFlipDenom,
        toggleDidUserFlipDenom,
    };

    return (
        <TradeDataContext.Provider value={tradeDataContext}>
            {props.children}
        </TradeDataContext.Provider>
    );
};

import React, { createContext, useMemo } from 'react';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { getDefaultChainId } from '../utils/data/chains';
import { getDefaultPairForChain } from '../utils/data/defaultTokens';

interface TradeDataContextIF {
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
    setChainId: (chainId: string) => void;
    setDenomInBase: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTokenAPrimary: React.Dispatch<React.SetStateAction<boolean>>;
    setDidUserFlipDenom: React.Dispatch<React.SetStateAction<boolean>>;
    toggleDidUserFlipDenom: () => void;
}

export const TradeDataContext = createContext<TradeDataContextIF>(
    {} as TradeDataContextIF,
);
console.log('Debug, getting items');
const dfltChainId = getDefaultChainId();
console.log('Debug, got chainId');

const dfltTokenA = getDefaultPairForChain(dfltChainId)[0];
const dfltTokenB = getDefaultPairForChain(dfltChainId)[1];

console.log('Debug, dfltTokenA: ', { dfltTokenA, dfltTokenB, dfltChainId });

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

    const setChainId = (chainId: string) => {
        if (tokenA.chainId !== parseInt(chainId)) {
            const [_tokenA, _tokenB] = getDefaultPairForChain(chainId);
            setTokenA(_tokenA);
            setTokenB(_tokenB);
        }
    };

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
        setChainId,
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

import { sortBaseQuoteTokens } from '@crocswap-libs/sdk';
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
import { getDefaultPairForChain } from '../ambient-utils/constants';
import { MAINNET_TOKENS } from '../ambient-utils/constants/networks/ethereumMainnet';
import {
    isBtcPair,
    isETHPair,
    isStablePair,
    translateTokenSymbol,
} from '../ambient-utils/dataLayer';
import { TokenIF } from '../ambient-utils/types';
import { AppStateContext } from './AppStateContext';
import { TokenContext } from './TokenContext';

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
    currentPoolPriceTick: number | undefined;
    slippageTolerance: number;

    setTokenA: Dispatch<SetStateAction<TokenIF>>;
    setTokenB: Dispatch<SetStateAction<TokenIF>>;
    setDenomInBase: Dispatch<SetStateAction<boolean>>;
    setIsTokenAPrimary: Dispatch<SetStateAction<boolean>>;
    setDidUserFlipDenom: Dispatch<SetStateAction<boolean>>;
    toggleDidUserFlipDenom: () => void;
    setSoloToken: Dispatch<SetStateAction<TokenIF>>;
    setShouldSwapDirectionReverse: Dispatch<SetStateAction<boolean>>;
    setPrimaryQuantity: Dispatch<SetStateAction<string>>;
    setLimitTick: Dispatch<SetStateAction<number | undefined>>;
    setPoolPriceNonDisplay: Dispatch<SetStateAction<number>>;
    setSlippageTolerance: Dispatch<SetStateAction<number>>;
    defaultRangeWidthForActivePool: number;
    getDefaultRangeWidthForTokenPair: (
        chainId: string,
        baseAddress: string,
        quoteAddress: string,
    ) => number;
    noGoZoneBoundaries: number[];
    setNoGoZoneBoundaries: Dispatch<SetStateAction<number[]>>;
    blackListedTimeParams: Map<string, Set<number>>;
    addToBlackList: (tokenPair: string, timeParam: number) => void;
    activeTab: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
}

export const TradeDataContext = createContext({} as TradeDataContextIF);
// Have to set these values to something on load, so we use default pair
// for default chain. Don't worry if user is coming in to another chain,
// since these will get updated by useUrlParams() in any context where a
// pair is necessary at load time

export const TradeDataContextProvider = (props: { children: ReactNode }) => {
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { tokens } = useContext(TokenContext);

    const savedTokenASymbol = localStorage.getItem('tokenA');
    const savedTokenBSymbol = localStorage.getItem('tokenB');

    const [dfltTokenA, dfltTokenB]: [TokenIF, TokenIF] =
        getDefaultPairForChain(chainId);

    // Limit NoGoZone
    const [noGoZoneBoundaries, setNoGoZoneBoundaries] = useState([0, 0]);

    const [activeTab, setActiveTab] = useState<string>(() => {
        const savedTab = localStorage.getItem('activeTradeTabOnMobile');
        return savedTab ? savedTab : 'Order';
    });

    const tokensMatchingA =
        savedTokenASymbol === dfltTokenA.symbol
            ? [dfltTokenA]
            : tokens.getTokensByNameOrSymbol(
                  savedTokenASymbol || '',
                  chainId,
                  true,
              );
    const tokensMatchingB =
        savedTokenBSymbol === dfltTokenA.symbol
            ? [dfltTokenA]
            : tokens.getTokensByNameOrSymbol(
                  savedTokenBSymbol || '',
                  chainId,
                  true,
              );

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

    const [tokenA, setTokenA] = useState<TokenIF>(() => {
        return firstTokenMatchingA
            ? firstTokenMatchingA
            : shouldReverseDefaultTokens
              ? dfltTokenB
              : dfltTokenA;
    });

    const [tokenB, setTokenB] = useState<TokenIF>(
        firstTokenMatchingB
            ? firstTokenMatchingB
            : shouldReverseDefaultTokens
              ? dfltTokenA
              : dfltTokenB,
    );

    const [blackListedTimeParams, setBlackListedTimeParams] = useState<
        Map<string, Set<number>>
    >(new Map());

    useEffect(() => {
        // update tokenA and tokenB when chain changes
        setTokenA(
            firstTokenMatchingA
                ? firstTokenMatchingA
                : shouldReverseDefaultTokens
                  ? dfltTokenB
                  : dfltTokenA,
        );
        setTokenB(
            firstTokenMatchingB
                ? firstTokenMatchingB
                : shouldReverseDefaultTokens
                  ? dfltTokenA
                  : dfltTokenB,
        );
    }, [chainId]);

    const [
        areDefaultTokensUpdatedForChain,
        setAreDefaultTokensUpdatedForChain,
    ] = useState<boolean>(false);
    const [isDenomBase, setDenomInBase] = useState<boolean>(true);
    // TODO: this can likely be refactored out
    const [didUserFlipDenom, setDidUserFlipDenom] = useState<boolean>(false);

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

    const [soloToken, setSoloToken] = useState<TokenIF>(MAINNET_TOKENS.ETH);

    const [shouldSwapDirectionReverse, setShouldSwapDirectionReverse] =
        useState<boolean>(false);

    const [primaryQuantity, setPrimaryQuantity] = useState<string>(
        localStorage.getItem('primaryQuantity') || '',
    );
    const [isTokenAPrimary, setIsTokenAPrimary] = useState<boolean>(
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
        tokenA.symbol &&
            localStorage.setItem('tokenA', translateTokenSymbol(tokenA.symbol));
        tokenB.symbol &&
            localStorage.setItem('tokenB', translateTokenSymbol(tokenB.symbol));
    }, [tokenA.address, tokenB.address]);

    useEffect(() => {
        localStorage.setItem('primaryQuantity', primaryQuantity);
    }, [primaryQuantity]);

    const [limitTick, setLimitTick] = useState<number | undefined>(undefined);
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);

    const currentPoolPriceTick = useMemo(
        () =>
            poolPriceNonDisplay === undefined || poolPriceNonDisplay === 0
                ? undefined
                : Math.log(poolPriceNonDisplay) / Math.log(1.0001),
        [poolPriceNonDisplay],
    );

    useEffect(() => {
        setPoolPriceNonDisplay(0);
        setDidUserFlipDenom(false);
    }, [baseToken.address + quoteToken.address]);

    const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

    const getDefaultRangeWidthForTokenPair = (
        chainId: string,
        baseAddress: string,
        quoteAddress: string,
    ) => {
        const isPoolStable =
            isStablePair(baseAddress, quoteAddress) ||
            isETHPair(baseAddress, quoteAddress, chainId) ||
            isBtcPair(baseAddress, quoteAddress);
        const defaultWidth = isPoolStable ? 0.5 : 10;

        return defaultWidth;
    };

    const defaultRangeWidthForActivePool = useMemo(() => {
        const defaultWidth = getDefaultRangeWidthForTokenPair(
            chainId,
            baseToken.address,
            quoteToken.address,
        );
        return defaultWidth;
    }, [baseToken.address + quoteToken.address + chainId]);

    const addToBlackList = (tokenPair: string, timeParam: number) => {
        setBlackListedTimeParams((prev) => {
            if (prev.has(tokenPair)) {
                prev.get(tokenPair)?.add(timeParam);
            } else {
                prev.set(tokenPair, new Set([timeParam]));
            }
            return prev;
        });
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
        defaultRangeWidthForActivePool,
        getDefaultRangeWidthForTokenPair,
        noGoZoneBoundaries,
        setNoGoZoneBoundaries,
        blackListedTimeParams,
        addToBlackList,
        activeTab,
        setActiveTab,
    };

    return (
        <TradeDataContext.Provider value={tradeDataContext}>
            {props.children}
        </TradeDataContext.Provider>
    );
};

import { CrocImpact, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    memo,
} from 'react';
import { calcImpact } from '../../../App/functions/calcImpact';
import useDebounce from '../../../App/hooks/useDebounce';
import { ZERO_ADDRESS } from '../../../constants';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { FlexContainer } from '../../../styled/Common';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import {
    useAppSelector,
    useAppDispatch,
} from '../../../utils/hooks/reduxToolkit';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { formatTokenInput } from '../../../utils/numbers';
import {
    setIsTokenAPrimary,
    setShouldSwapDirectionReverse,
    setPrimaryQuantity,
    setIsTokenAPrimaryRange,
    setLimitTick,
} from '../../../utils/state/tradeDataSlice';
import TokenInput from '../../Global/TokenInput/TokenInput';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';

interface propsIF {
    sellQtyString: { value: string; set: Dispatch<SetStateAction<string>> };
    buyQtyString: { value: string; set: Dispatch<SetStateAction<string>> };
    isSellLoading: { value: boolean; set: Dispatch<SetStateAction<boolean>> };
    isBuyLoading: { value: boolean; set: Dispatch<SetStateAction<boolean>> };
    isWithdrawFromDexChecked: boolean;
    isSaveAsDexSurplusChecked: boolean;
    slippageTolerancePercentage: number;
    setSwapAllowed: Dispatch<SetStateAction<boolean>>;
    setPriceImpact: Dispatch<SetStateAction<CrocImpact | undefined>>;
    setIsLiquidityInsufficient: Dispatch<SetStateAction<boolean>>;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
}

function SwapTokenInput(props: propsIF) {
    const {
        sellQtyString: { value: sellQtyString, set: setSellQtyString },
        buyQtyString: { value: buyQtyString, set: setBuyQtyString },
        isSellLoading: { value: isSellLoading, set: setIsSellLoading },
        isBuyLoading: { value: isBuyLoading, set: setIsBuyLoading },
        isWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        slippageTolerancePercentage,
        setSwapAllowed,
        setPriceImpact,
        setIsLiquidityInsufficient,
        toggleDexSelection,
    } = props;

    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { poolPriceDisplay, isPoolInitialized } = useContext(PoolContext);
    const {
        baseToken: {
            balance: baseTokenBalance,
            dexBalance: baseTokenDexBalance,
        },
        quoteToken: {
            balance: quoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
        },
    } = useContext(TradeTokenContext);
    const { showSwapPulseAnimation } = useContext(TradeTableContext);

    const dispatch = useAppDispatch();
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const {
        tokenA,
        tokenB,
        primaryQuantity,
        isTokenAPrimary,
        isTokenAPrimaryRange,
        shouldSwapDirectionReverse,
    } = useAppSelector((state) => state.tradeData);
    // hook to generate navigation actions with pre-loaded path
    const linkGenAny: linkGenMethodsIF = useLinkGen();

    const [lastInput, setLastInput] = useState<string | undefined>();
    const [disableReverseTokens, setDisableReverseTokens] = useState(false);

    const isSellTokenEth = tokenA.address === ZERO_ADDRESS;
    const isBuyTokenEth = tokenB.address === ZERO_ADDRESS;
    const sortedTokens = sortBaseQuoteTokens(tokenA.address, tokenB.address);
    const isSellTokenBase = tokenA.address === sortedTokens[0];

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenBBalance = isSellTokenBase
        ? quoteTokenBalance
        : baseTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;
    const tokenBDexBalance = isSellTokenBase
        ? quoteTokenDexBalance
        : baseTokenDexBalance;

    // Let input rest 3/4 of a second before triggering an update
    const debouncedLastInput = useDebounce(lastInput, 750);

    useEffect(() => {
        if (isTokenAPrimary) {
            if (sellQtyString !== '') {
                setIsBuyLoading(true);
            }
        } else {
            if (buyQtyString !== '') {
                setIsSellLoading(true);
            }
        }
    }, []);

    useEffect(() => {
        handleBlockUpdate();
    }, [lastBlockNumber]);

    useEffect(() => {
        if (shouldSwapDirectionReverse) {
            reverseTokens();
            dispatch(setShouldSwapDirectionReverse(false));
        }
    }, [shouldSwapDirectionReverse]);

    useEffect(() => {
        if (debouncedLastInput !== undefined) {
            isTokenAPrimary
                ? handleTokenAChangeEvent(debouncedLastInput)
                : handleTokenBChangeEvent(debouncedLastInput);
        }
    }, [debouncedLastInput]);

    useEffect(() => {
        (async () => {
            await refreshTokenData();
            setDisableReverseTokens(false);
        })();
    }, [tokenA, tokenB]);

    const reverseTokens = useCallback((): void => {
        if (disableReverseTokens || !isPoolInitialized) return;

        dispatch(setLimitTick(undefined));

        setDisableReverseTokens(true);

        isTokenAPrimary
            ? sellQtyString !== '' && parseFloat(sellQtyString) > 0
                ? setIsSellLoading(true)
                : null
            : buyQtyString !== '' && parseFloat(buyQtyString) > 0
            ? setIsBuyLoading(true)
            : null;

        linkGenAny.navigate({
            chain: chainId,
            tokenA: tokenB.address,
            tokenB: tokenA.address,
        });
        if (!isTokenAPrimary) {
            setSellQtyString(primaryQuantity);
        } else {
            setBuyQtyString(primaryQuantity);
        }
        dispatch(setIsTokenAPrimary(!isTokenAPrimary));
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryRange));
    }, [
        crocEnv,
        poolPriceDisplay,
        sellQtyString,
        buyQtyString,
        slippageTolerancePercentage,
        isTokenAPrimary,
        disableReverseTokens,
    ]);

    const handleBlockUpdate = () => {
        setDisableReverseTokens(true);
        isTokenAPrimary ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
    };

    async function refreshImpact(
        input: string,
        sellToken: boolean,
    ): Promise<number | undefined> {
        if (isNaN(parseFloat(input)) || parseFloat(input) === 0 || !crocEnv) {
            return undefined;
        }

        const impact = await calcImpact(
            sellToken,
            crocEnv,
            tokenA.address,
            tokenB.address,
            slippageTolerancePercentage / 100,
            input,
        );
        setPriceImpact(impact);

        isTokenAPrimary ? setIsBuyLoading(false) : setIsSellLoading(false);

        if (impact) {
            setIsLiquidityInsufficient(false);
            return parseFloat(sellToken ? impact.buyQty : impact.sellQty);
        } else {
            setIsLiquidityInsufficient(true);
            setSwapAllowed(false);
            return undefined;
        }
    }

    const debouncedTokenAChangeEvent = (value: string) => {
        setIsBuyLoading(true);
        setSellQtyString(value);
        dispatch(setPrimaryQuantity(value));
        setDisableReverseTokens(true);
        setLastInput(value);

        dispatch(setIsTokenAPrimary(true));
    };

    const debouncedTokenBChangeEvent = (value: string) => {
        setIsSellLoading(true);
        setBuyQtyString(value);
        dispatch(setPrimaryQuantity(value));
        setDisableReverseTokens(true);
        setLastInput(value);

        dispatch(setIsTokenAPrimary(false));
    };

    const handleTokenAChangeEvent = useMemo(
        () => async (value?: string) => {
            if (!crocEnv) return;
            let rawTokenBQty = undefined;
            if (value !== undefined) {
                if (parseFloat(value) !== 0) {
                    const truncatedInputStr = formatTokenInput(value, tokenA);
                    rawTokenBQty = await refreshImpact(truncatedInputStr, true);
                }
            } else {
                rawTokenBQty = await refreshImpact(primaryQuantity, true);
            }

            const truncatedTokenBQty = rawTokenBQty
                ? rawTokenBQty < 2
                    ? rawTokenBQty.toPrecision(3)
                    : truncateDecimals(rawTokenBQty, rawTokenBQty < 100 ? 3 : 2)
                : '';

            setBuyQtyString(truncatedTokenBQty);
            setIsBuyLoading(false);
            setDisableReverseTokens(false);
        },
        [
            crocEnv,
            isPoolInitialized,
            poolPriceDisplay,
            tokenA.address,
            tokenB.address,
            slippageTolerancePercentage,
            isTokenAPrimary,
            sellQtyString,
            buyQtyString,
        ],
    );

    const handleTokenBChangeEvent = useMemo(
        () => async (value?: string) => {
            if (!crocEnv) return;

            let rawTokenAQty: number | undefined;
            if (value !== undefined) {
                if (parseFloat(value) !== 0) {
                    const truncatedInputStr = formatTokenInput(value, tokenB);
                    rawTokenAQty = await refreshImpact(
                        truncatedInputStr,
                        false,
                    );
                }
            } else {
                rawTokenAQty = await refreshImpact(primaryQuantity, false);
            }

            const truncatedTokenAQty = rawTokenAQty
                ? rawTokenAQty < 2
                    ? rawTokenAQty.toPrecision(3)
                    : truncateDecimals(rawTokenAQty, rawTokenAQty < 100 ? 3 : 2)
                : '';
            setSellQtyString(truncatedTokenAQty);
            setIsSellLoading(false);
            setDisableReverseTokens(false);
        },
        [
            crocEnv,
            poolPriceDisplay,
            isPoolInitialized,
            tokenA.address,
            tokenB.address,
            slippageTolerancePercentage,
            isTokenAPrimary,
            sellQtyString,
            buyQtyString,
        ],
    );

    const refreshTokenData = async () => {
        if (isTokenAPrimary) {
            setIsBuyLoading(true);
            handleTokenAChangeEvent && (await handleTokenAChangeEvent());
            setIsBuyLoading(false);
        } else {
            setIsSellLoading(true);
            handleTokenBChangeEvent && (await handleTokenBChangeEvent());
            setIsSellLoading(false);
        }
    };

    return (
        <FlexContainer flexDirection='column' gap={8}>
            <TokenInput
                fieldId='swap_sell'
                tokenAorB='A'
                token={tokenA}
                tokenInput={sellQtyString}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={isSellTokenEth}
                isDexSelected={isWithdrawFromDexChecked}
                isLoading={isSellLoading}
                showPulseAnimation={showSwapPulseAnimation}
                handleTokenInputEvent={debouncedTokenAChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                showWallet={isUserConnected}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setSellQtyString(formatTokenInput(val, tokenA, isMax));
                }}
            />
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
                padding='0 0 8px 0'
            >
                <TokensArrow
                    disabled={
                        disableReverseTokens || isBuyLoading || isSellLoading
                    }
                    onClick={reverseTokens}
                />
            </FlexContainer>
            <TokenInput
                fieldId='swap_buy'
                tokenAorB='B'
                token={tokenB}
                tokenInput={buyQtyString}
                tokenBalance={tokenBBalance}
                tokenDexBalance={tokenBDexBalance}
                isTokenEth={isBuyTokenEth}
                isDexSelected={isSaveAsDexSurplusChecked}
                isLoading={isBuyLoading}
                showPulseAnimation={showSwapPulseAnimation}
                handleTokenInputEvent={debouncedTokenBChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('B')}
                showWallet={isUserConnected}
                hideWalletMaxButton
                handleRefresh={refreshTokenData}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setBuyQtyString(formatTokenInput(val, tokenB, isMax));
                }}
            />
        </FlexContainer>
    );
}

export default memo(SwapTokenInput);

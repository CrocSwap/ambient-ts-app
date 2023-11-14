import { CrocImpact } from '@crocswap-libs/sdk';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
    useMemo,
    memo,
} from 'react';
import { calcImpact } from '../../../App/functions/calcImpact';
import useDebounce from '../../../App/hooks/useDebounce';
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
    setShouldSwapDirectionReverse,
    setPrimaryQuantity,
    setLimitTick,
} from '../../../utils/state/tradeDataSlice';
import TokenInputWithWalletBalance from '../../Form/TokenInputWithWalletBalance';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { RangeContext } from '../../../contexts/RangeContext';

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
    isLiquidityInsufficient: boolean;
    setIsLiquidityInsufficient: Dispatch<SetStateAction<boolean>>;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
    amountToReduceEth: number;
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
        isLiquidityInsufficient,
        setIsLiquidityInsufficient,
        toggleDexSelection,
        amountToReduceEth,
    } = props;

    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { poolPriceDisplay, isPoolInitialized } = useContext(PoolContext);
    const {
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isTokenAEth: isSellTokenEth,
        isTokenBEth: isBuyTokenEth,
        rtkMatchesParams,
    } = useContext(TradeTokenContext);

    const { showSwapPulseAnimation } = useContext(TradeTableContext);
    const { setIsTokenAPrimaryRange, isTokenAPrimaryRange } =
        useContext(RangeContext);
    const dispatch = useAppDispatch();
    const { isUserConnected } = useContext(UserDataContext);

    const { primaryQuantity, shouldSwapDirectionReverse } = useAppSelector(
        (state) => state.tradeData,
    );
    const { tokenA, tokenB, isTokenAPrimary, setIsTokenAPrimary } =
        useContext(TradeDataContext);
    // hook to generate navigation actions with pre-loaded path
    const linkGenAny: linkGenMethodsIF = useLinkGen();

    const [lastInput, setLastInput] = useState<string | undefined>();
    const [disableReverseTokens, setDisableReverseTokens] = useState(false);

    // Let input rest 3/4 of a second before triggering an update
    const debouncedLastInput = useDebounce(lastInput, 750);

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
            if (rtkMatchesParams) {
                await refreshTokenData();
                setDisableReverseTokens(false);
            }
        })();
    }, [rtkMatchesParams]);

    const reverseTokens = (): void => {
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
        setIsTokenAPrimary(!isTokenAPrimary);
        setIsTokenAPrimaryRange(!isTokenAPrimaryRange);
    };

    const handleBlockUpdate = () => {
        if (rtkMatchesParams) {
            setDisableReverseTokens(true);
            isTokenAPrimary
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    };

    async function refreshImpact(
        input: string,
        sellToken: boolean,
    ): Promise<number | undefined> {
        if (isNaN(parseFloat(input)) || parseFloat(input) === 0 || !crocEnv) {
            setIsLiquidityInsufficient(false);
            setPriceImpact(undefined);
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

        setIsTokenAPrimary(true);
    };

    const debouncedTokenBChangeEvent = (value: string) => {
        setIsSellLoading(true);
        setBuyQtyString(value);
        dispatch(setPrimaryQuantity(value));
        setDisableReverseTokens(true);
        setLastInput(value);

        setIsTokenAPrimary(false);
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
            <TokenInputWithWalletBalance
                fieldId='swap_sell'
                tokenAorB='A'
                token={tokenA}
                tokenInput={buyQtyString !== '' ? sellQtyString : ''}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={isSellTokenEth}
                isDexSelected={isWithdrawFromDexChecked}
                isLoading={isSellLoading && buyQtyString !== ''}
                showPulseAnimation={showSwapPulseAnimation}
                handleTokenInputEvent={debouncedTokenAChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                showWallet={isUserConnected}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setSellQtyString(formatTokenInput(val, tokenA, isMax));
                }}
                amountToReduceEth={amountToReduceEth}
            />
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
            >
                <TokensArrow
                    disabled={
                        disableReverseTokens || isBuyLoading || isSellLoading
                    }
                    onClick={reverseTokens}
                />
            </FlexContainer>
            <TokenInputWithWalletBalance
                fieldId='swap_buy'
                tokenAorB='B'
                token={tokenB}
                tokenInput={
                    sellQtyString !== '' || isLiquidityInsufficient
                        ? buyQtyString
                        : ''
                }
                tokenBalance={tokenBBalance}
                tokenDexBalance={tokenBDexBalance}
                isTokenEth={isBuyTokenEth}
                isDexSelected={isSaveAsDexSurplusChecked}
                isLoading={isBuyLoading && sellQtyString !== ''}
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

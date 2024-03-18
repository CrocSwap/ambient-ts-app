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
import { truncateDecimals } from '../../../ambient-utils/dataLayer';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { formatTokenInput } from '../../../utils/numbers';
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
    setLastImpactQuery: Dispatch<
        SetStateAction<
            | {
                  input: string;
                  impact: CrocImpact | undefined;
              }
            | undefined
        >
    >;
    isLiquidityInsufficient: boolean;
    setIsLiquidityInsufficient: Dispatch<SetStateAction<boolean>>;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
    amountToReduceNativeTokenQty: number;
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
        setLastImpactQuery,
        isLiquidityInsufficient,
        setIsLiquidityInsufficient,
        toggleDexSelection,
        amountToReduceNativeTokenQty,
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
        contextMatchesParams,
    } = useContext(TradeTokenContext);

    const { showSwapPulseAnimation } = useContext(TradeTableContext);
    const { setIsTokenAPrimaryRange, isTokenAPrimaryRange } =
        useContext(RangeContext);
    const { isUserConnected } = useContext(UserDataContext);
    const {
        tokenA,
        tokenB,
        isTokenAPrimary,
        setIsTokenAPrimary,
        primaryQuantity,
        setPrimaryQuantity,
        setLimitTick,
        shouldSwapDirectionReverse,
        setShouldSwapDirectionReverse,
    } = useContext(TradeDataContext);
    // hook to generate navigation actions with pre-loaded path
    const linkGenAny: linkGenMethodsIF = useLinkGen();

    const [lastInput, setLastInput] = useState<string | undefined>();

    // Let input rest 3/4 of a second before triggering an update
    const debouncedLastInput = useDebounce(lastInput, 750);

    const reverseTokens = (skipQuantityReverse?: boolean): void => {
        if (!isPoolInitialized) return;

        linkGenAny.navigate({
            chain: chainId,
            tokenA: tokenB.address,
            tokenB: tokenA.address,
        });

        if (!skipQuantityReverse) {
            setLastImpactQuery(() => {
                return { input: primaryQuantity, impact: undefined };
            });
            !isTokenAPrimary
                ? sellQtyString !== '' && parseFloat(sellQtyString) > 0
                    ? setIsSellLoading(true)
                    : null
                : buyQtyString !== '' && parseFloat(buyQtyString) > 0
                ? setIsBuyLoading(true)
                : null;
            if (isTokenAPrimary) {
                setSellQtyString(primaryQuantity);
            } else {
                setBuyQtyString(primaryQuantity);
            }
        }
        setIsTokenAPrimaryRange(!isTokenAPrimaryRange);

        setLimitTick(undefined);
    };

    const handleBlockUpdate = () => {
        if (contextMatchesParams) {
            isTokenAPrimary
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    };

    useEffect(() => {
        handleBlockUpdate();
    }, [lastBlockNumber, contextMatchesParams, isTokenAPrimary]);

    useEffect(() => {
        if (shouldSwapDirectionReverse) {
            reverseTokens(false);
            setShouldSwapDirectionReverse(false);
        }
    }, [shouldSwapDirectionReverse]);

    useEffect(() => {
        if (debouncedLastInput !== undefined) {
            isTokenAPrimary
                ? handleTokenAChangeEvent(debouncedLastInput)
                : handleTokenBChangeEvent(debouncedLastInput);
        }
    }, [debouncedLastInput]);

    async function refreshImpact(
        input: string,
        sellToken: boolean,
    ): Promise<number | undefined> {
        if (isNaN(parseFloat(input)) || parseFloat(input) === 0 || !crocEnv) {
            setIsLiquidityInsufficient(false);
            setLastImpactQuery((lastQuery) => {
                return { input: lastQuery?.input || '', impact: undefined };
            });
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
        setLastImpactQuery((lastQuery) => {
            if (lastQuery?.input === input) {
                return { input: input, impact: impact };
            } else {
                return { input: lastQuery?.input || '', impact: undefined };
            }
        });

        isTokenAPrimary ? setIsBuyLoading(false) : setIsSellLoading(false);

        // prevent swaps with a price impact in excess of -99.99% or 1 million percent
        if (impact) {
            if (
                impact.percentChange < -0.9999 ||
                impact.percentChange > 10000
            ) {
                setIsLiquidityInsufficient(true);
                setSwapAllowed(false);
                return undefined;
            } else {
                setIsLiquidityInsufficient(false);
                return parseFloat(sellToken ? impact.buyQty : impact.sellQty);
            }
        } else {
            setIsLiquidityInsufficient(true);
            setSwapAllowed(false);
            return undefined;
        }
    }

    const debouncedTokenAChangeEvent = (value: string) => {
        if (parseFloat(value) > 0) setIsBuyLoading(true);
        setSellQtyString(value);
        setPrimaryQuantity(value);
        setLastInput(value);

        setIsTokenAPrimary(true);
    };

    const debouncedTokenBChangeEvent = (value: string) => {
        if (parseFloat(value) > 0) setIsSellLoading(true);
        setBuyQtyString(value);
        setPrimaryQuantity(value);
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
                    setLastImpactQuery({
                        input: truncatedInputStr,
                        impact: undefined,
                    });

                    rawTokenBQty = await refreshImpact(truncatedInputStr, true);
                }
            } else {
                setLastImpactQuery({
                    input: primaryQuantity,
                    impact: undefined,
                });
                rawTokenBQty = await refreshImpact(primaryQuantity, true);
            }

            const truncatedTokenBQty = rawTokenBQty
                ? rawTokenBQty < 2
                    ? rawTokenBQty.toPrecision(6)
                    : truncateDecimals(rawTokenBQty, rawTokenBQty < 100 ? 3 : 2)
                : '';

            setBuyQtyString(truncatedTokenBQty);
            setIsBuyLoading(false);
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
            primaryQuantity,
        ],
    );

    const handleTokenBChangeEvent = useMemo(
        () => async (value?: string) => {
            if (!crocEnv) return;

            let rawTokenAQty: number | undefined;
            if (value !== undefined) {
                if (parseFloat(value) !== 0) {
                    const truncatedInputStr = formatTokenInput(value, tokenB);
                    setLastImpactQuery({
                        input: truncatedInputStr,
                        impact: undefined,
                    });
                    rawTokenAQty = await refreshImpact(
                        truncatedInputStr,
                        false,
                    );
                }
            } else {
                setLastImpactQuery({
                    input: primaryQuantity,
                    impact: undefined,
                });
                rawTokenAQty = await refreshImpact(primaryQuantity, false);
            }

            const truncatedTokenAQty = rawTokenAQty
                ? rawTokenAQty < 2
                    ? rawTokenAQty.toPrecision(6)
                    : truncateDecimals(rawTokenAQty, rawTokenAQty < 100 ? 3 : 2)
                : '';
            setSellQtyString(truncatedTokenAQty);
            setIsSellLoading(false);
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
            primaryQuantity,
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

    // refresh token data when swap module initializes
    useEffect(() => {
        refreshTokenData();
    }, []);

    return (
        <FlexContainer flexDirection='column' gap={8}>
            <TokenInputWithWalletBalance
                fieldId='swap_sell'
                tokenAorB='A'
                token={tokenA}
                tokenInput={
                    isTokenAPrimary ||
                    isLiquidityInsufficient ||
                    (!isTokenAPrimary && parseFloat(buyQtyString) > 0)
                        ? sellQtyString
                        : ''
                }
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
                amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
            />
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
            >
                <TokensArrow
                    disabled={isBuyLoading || isSellLoading}
                    onClick={() => {
                        isTokenAPrimary
                            ? sellQtyString !== '' &&
                              parseFloat(sellQtyString) > 0
                                ? setIsSellLoading(true)
                                : null
                            : buyQtyString !== '' &&
                              parseFloat(buyQtyString) > 0
                            ? setIsBuyLoading(true)
                            : null;

                        if (!isTokenAPrimary) {
                            setSellQtyString(primaryQuantity);
                        } else {
                            setBuyQtyString(primaryQuantity);
                        }
                        setIsTokenAPrimary(!isTokenAPrimary);

                        reverseTokens(true);
                    }}
                />
            </FlexContainer>
            <TokenInputWithWalletBalance
                fieldId='swap_buy'
                tokenAorB='B'
                token={tokenB}
                tokenInput={
                    !isTokenAPrimary ||
                    isLiquidityInsufficient ||
                    parseFloat(sellQtyString) > 0
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
                amountToReduceNativeTokenQty={0} // value not used for buy token
            />
        </FlexContainer>
    );
}

export default memo(SwapTokenInput);

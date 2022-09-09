// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction, useState, useEffect } from 'react';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
} from '../../../../utils/state/tradeDataSlice';

// interface for component props
interface RangeCurrencyConverterPropsIF {
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isLiq?: boolean;
    poolPriceNonDisplay: number | undefined;
    isAdvancedMode: boolean;
    tokenPair: TokenPairIF;
    isTokenAPrimaryLocal: boolean;
    setIsTokenAPrimaryLocal: Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    isAmbient: boolean;
    depositSkew: number;
    setIsSellTokenPrimary?: Dispatch<SetStateAction<boolean>>;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    setRangeButtonErrorMessage: Dispatch<SetStateAction<string>>;
    setRangeAllowed: Dispatch<SetStateAction<boolean>>;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isOutOfRange: boolean;
    rangeSpanAboveCurrentPrice: number;
    rangeSpanBelowCurrentPrice: number;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

// central React functional component
export default function RangeCurrencyConverter(props: RangeCurrencyConverterPropsIF) {
    const {
        chainId,
        isLiq,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        poolPriceNonDisplay,
        tokenPair,
        isTokenABase,
        isTokenAPrimaryLocal,
        setIsTokenAPrimaryLocal,
        isAmbient,
        depositSkew,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        setTokenAInputQty,
        setTokenBInputQty,
        setRangeButtonErrorMessage,
        setRangeAllowed,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        isOutOfRange,
        rangeSpanAboveCurrentPrice,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const dispatch = useAppDispatch();

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<number>(0);
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<number>(0);

    const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;
    const tokenADexBalance = isTokenABase ? baseTokenDexBalance : quoteTokenDexBalance;
    const tokenBDexBalance = isTokenABase ? quoteTokenDexBalance : baseTokenDexBalance;

    const tradeData = useAppSelector((state) => state.tradeData);

    const tokens = {
        baseToken: tradeData.baseToken.address,
        quoteToken: tradeData.quoteToken.address,
    };

    useEffect(() => {
        setTokenAQtyValue(0);
        setTokenBQtyValue(0);
    }, [JSON.stringify(tokens)]);

    useEffect(() => {
        if (tradeData.isTokenAPrimaryRange !== isTokenAPrimaryLocal) {
            if (tradeData.isTokenAPrimaryRange === true) {
                setIsTokenAPrimaryLocal(true);
                dispatch(setPrimaryQuantityRange(tokenAQtyLocal.toString()));
            } else {
                setIsTokenAPrimaryLocal(false);
                dispatch(setPrimaryQuantityRange(tokenBQtyLocal.toString()));
            }
        }
    }, [tradeData.isTokenAPrimaryRange]);

    const primaryQuantityRange = tradeData.primaryQuantityRange;

    useEffect(() => {
        if (tradeData) {
            if (tradeData.isTokenAPrimaryRange) {
                setTokenAQtyLocal(parseFloat(tradeData.primaryQuantityRange));
                setTokenAInputQty(tradeData.primaryQuantityRange);
                const sellQtyField = document.getElementById(
                    'A-range-quantity',
                ) as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantityRange === 'NaN' ||
                        tradeData.primaryQuantityRange === '0'
                            ? ''
                            : tradeData.primaryQuantityRange;
                }
            } else {
                setTokenBQtyLocal(parseFloat(tradeData.primaryQuantityRange));
                setTokenBInputQty(tradeData.primaryQuantityRange);
                const buyQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantityRange === 'NaN' ||
                        tradeData.primaryQuantityRange === '0'
                            ? ''
                            : tradeData.primaryQuantityRange;
                }
            }
        }
    }, []);

    const setTokenAQtyValue = (value: number) => {
        if (poolPriceNonDisplay === undefined) return;
        setTokenAQtyLocal(parseFloat(truncateDecimals(value, tokenPair.dataTokenA.decimals)));
        setTokenAInputQty(truncateDecimals(value, tokenPair.dataTokenA.decimals));
        handleRangeButtonMessageTokenA(value);

        const qtyTokenB =
            calculateSecondaryDepositQty(
                poolPriceNonDisplay,
                tokenPair.dataTokenA.decimals,
                tokenPair.dataTokenB.decimals,
                value.toString(),
                true,
                isTokenABase,
                isAmbient,
                depositSkew,
            ) ?? 0;

        handleSecondaryTokenQty('B', value, qtyTokenB);

        // handleRangeButtonMessageTokenB(qtyTokenB);

        const truncatedTokenBQty = truncateDecimals(
            qtyTokenB,
            tokenPair.dataTokenB.decimals > 10 ? 10 : tokenPair.dataTokenB.decimals,
        ).toString();

        const tokenBQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;

        if (truncatedTokenBQty !== '0') {
            tokenBQtyField.value = truncatedTokenBQty;
            if (primaryQuantityRange !== value.toString()) {
                dispatch(setPrimaryQuantityRange(value.toString()));
            }
            setIsTokenAPrimaryLocal(true);
            setTokenBQtyLocal(parseFloat(truncatedTokenBQty));
            setTokenBInputQty(truncatedTokenBQty);
        } else {
            tokenBQtyField.value = '';
            // dispatch(setPrimaryQuantityRange('0'));
            setIsTokenAPrimaryLocal(true);
            // setTokenBQtyLocal(0);
            // setTokenBInputQty('0');
        }
    };

    const setTokenBQtyValue = (value: number) => {
        if (poolPriceNonDisplay === undefined) return;
        setTokenBQtyLocal(parseFloat(truncateDecimals(value, tokenPair.dataTokenB.decimals)));
        setTokenBInputQty(truncateDecimals(value, tokenPair.dataTokenB.decimals));
        handleRangeButtonMessageTokenB(value);

        const qtyTokenA =
            calculateSecondaryDepositQty(
                poolPriceNonDisplay,
                tokenPair.dataTokenA.decimals,
                tokenPair.dataTokenB.decimals,
                value.toString(),
                false,
                isTokenABase,
                isAmbient,
                depositSkew,
            ) ?? 0;

        handleSecondaryTokenQty('A', value, qtyTokenA);
        // handleRangeButtonMessageTokenA(qtyTokenA);

        const truncatedTokenAQty = truncateDecimals(
            qtyTokenA,
            tokenPair.dataTokenA.decimals > 10 ? 10 : tokenPair.dataTokenA.decimals,
        ).toString();

        const tokenAQtyField = document.getElementById('A-range-quantity') as HTMLInputElement;
        if (truncatedTokenAQty !== '0') {
            tokenAQtyField.value = truncatedTokenAQty;
            if (primaryQuantityRange !== value.toString()) {
                dispatch(setPrimaryQuantityRange(value.toString()));
            }
            setIsTokenAPrimaryLocal(false);
            setTokenAQtyLocal(parseFloat(truncatedTokenAQty));
            setTokenAInputQty(truncatedTokenAQty);
        } else {
            tokenAQtyField.value = '';
            // dispatch(setPrimaryQuantityRange('0'));
            setIsTokenAPrimaryLocal(false);
            // setTokenAQtyLocal(0);
            // setTokenAInputQty('0');
        }
    };

    const reverseTokens = (): void => {
        // console.log('reversing tokens');
        if (!isTokenAPrimaryLocal) {
            setTokenAQtyValue(tokenBQtyLocal);

            const tokenAField = document.getElementById('A-range-quantity') as HTMLInputElement;
            if (tokenAField) {
                tokenAField.value = isNaN(tokenBQtyLocal) ? '' : tokenBQtyLocal.toString();
            }
        } else {
            setTokenBQtyValue(tokenAQtyLocal);
            const tokenBField = document.getElementById('B-range-quantity') as HTMLInputElement;
            if (tokenBField) {
                tokenBField.value = isNaN(tokenAQtyLocal) ? '' : tokenAQtyLocal.toString();
            }
        }

        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryLocal));
    };

    const handleRangeButtonMessageTokenA = (tokenAAmount: number) => {
        if (poolPriceNonDisplay === 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (tokenAAmount > parseFloat(tokenABalance)) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage(
                `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
            );
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            if (tokenBQtyLocal <= 0) {
                setRangeAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
            }
        } else {
            if (parseFloat(tokenBBalance) > tokenBQtyLocal) {
                setRangeAllowed(true);
            }
        }
    };

    const handleRangeButtonMessageTokenB = (tokenBAmount: number) => {
        if (poolPriceNonDisplay === 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (tokenBAmount > parseFloat(tokenBBalance)) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage(
                `${tokenPair.dataTokenB.symbol} Amount Exceeds Wallet Balance`,
            );
        } else if (isNaN(tokenBAmount) || tokenBAmount <= 0) {
            if (tokenAQtyLocal <= 0) {
                setRangeAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
            }
        } else {
            if (parseFloat(tokenABalance) > tokenAQtyLocal) {
                setRangeAllowed(true);
            }
        }
    };

    const handleSecondaryTokenQty = (
        secondaryToken: string,
        primaryTokenQty: number,
        secondaryTokenQty: number,
    ) => {
        if (secondaryToken === 'B') {
            handleRangeButtonMessageTokenB(secondaryTokenQty);
        } else {
            handleRangeButtonMessageTokenA(secondaryTokenQty);
        }
    };

    const handleTokenAQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const input = evt.target.value;
            if (input === '' || parseFloat(input) <= 0) {
                setRangeAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
            }
            setTokenAQtyValue(parseFloat(input));
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimaryRange(true));
            dispatch(setPrimaryQuantityRange(input));
            handleRangeButtonMessageTokenA(parseFloat(input));
        } else {
            if (!isOutOfRange) {
                if (tokenAQtyLocal) setTokenAQtyValue(tokenAQtyLocal);
            } else {
                // console.log({ rangeSpanAboveCurrentPrice });
                if (rangeSpanAboveCurrentPrice < 0) {
                    if (isTokenABase) {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                        }
                    } else {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                        }
                    }
                } else {
                    if (isTokenABase) {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                        }
                    } else {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                        }
                    }
                }
            }
        }
    };

    const handleTokenAChangeClick = (input: string) => {
        if (input === '' || parseFloat(input) <= 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        }
        setTokenAQtyValue(parseFloat(input));
        setIsTokenAPrimaryLocal(true);
        dispatch(setIsTokenAPrimaryRange(true));
        dispatch(setPrimaryQuantityRange(input));
        const tokenAField = document.getElementById('A-range-quantity') as HTMLInputElement;
        if (tokenAField) {
            tokenAField.value = input;
        }
    };

    const handleTokenBChangeClick = (input: string) => {
        if (input === '' || parseFloat(input) <= 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        }
        setTokenBQtyValue(parseFloat(input));
        setIsTokenAPrimaryLocal(false);
        dispatch(setIsTokenAPrimaryRange(false));
        dispatch(setPrimaryQuantityRange(input));
        const tokenBField = document.getElementById('B-range-quantity') as HTMLInputElement;
        if (tokenBField) {
            tokenBField.value = input;
        }
    };

    const handleTokenBQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const input = evt.target.value;
            if (input === '' || parseFloat(input) <= 0) {
                setRangeAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
            }
            setTokenBQtyValue(parseFloat(input));
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimaryRange(false));
            dispatch(setPrimaryQuantityRange(input));
            handleRangeButtonMessageTokenB(parseFloat(input));
        } else {
            if (!isOutOfRange) {
                if (tokenBQtyLocal) setTokenBQtyValue(tokenBQtyLocal);
            } else {
                // console.log({ rangeSpanAboveCurrentPrice });
                if (rangeSpanAboveCurrentPrice < 0) {
                    if (isTokenABase) {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                        }
                    } else {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                        }
                    }
                } else {
                    if (isTokenABase) {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                        }
                    } else {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                        }
                    }
                }
            }
        }
    };

    useEffect(() => {
        tradeData.isTokenAPrimaryRange
            ? handleTokenAQtyFieldUpdate()
            : handleTokenBQtyFieldUpdate();
    }, [
        poolPriceNonDisplay,
        depositSkew,
        // tradeData.isTokenAPrimaryRange,
        tokenABalance,
        tokenBBalance,
        // JSON.stringify(tokenPair),
    ]);

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        chainId: chainId,
        tokenPair: tokenPair,
        tokensBank: tokensBank,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        reverseTokens: reverseTokens,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        tokenADexBalance: tokenADexBalance,
        tokenBDexBalance: tokenBDexBalance,
        isTokenADisabled: isTokenADisabled,
        isTokenBDisabled: isTokenBDisabled,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    return (
        <section className={styles.currency_converter}>
            <div className={styles.title}> </div>
            {/* <div className={styles.title}>Collateral:</div> */}
            <RangeCurrencySelector
                fieldId='A'
                updateOtherQuantity={(event) => handleTokenAQtyFieldUpdate(event)}
                {...rangeCurrencySelectorCommonProps}
                isAdvancedMode={isAdvancedMode}
                handleChangeClick={handleTokenAChangeClick}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector
                fieldId='B'
                updateOtherQuantity={(event) => handleTokenBQtyFieldUpdate(event)}
                {...rangeCurrencySelectorCommonProps}
                isAdvancedMode={isAdvancedMode}
                handleChangeClick={handleTokenBChangeClick}
            />
        </section>
    );
}

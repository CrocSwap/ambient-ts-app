// START: Import React and Dongles
import { ChangeEvent, SetStateAction, useState, useEffect } from 'react';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
} from '../../../../utils/state/tradeDataSlice';

// interface for component props
interface RangeCurrencyConverterPropsIF {
    tokensBank: Array<TokenIF>;
    chainId: string;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isLiq?: boolean;
    poolPriceNonDisplay: number;
    isAdvancedMode: boolean;
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    isTokenAPrimaryLocal: boolean;
    setIsTokenAPrimaryLocal: React.Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    isAmbient: boolean;
    depositSkew: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
    truncatedTokenABalance: string;
    truncatedTokenBBalance: string;
    setTokenAInputQty: React.Dispatch<React.SetStateAction<string>>;
    setTokenBInputQty: React.Dispatch<React.SetStateAction<string>>;
    setRangeButtonErrorMessage: React.Dispatch<React.SetStateAction<string>>;
    setRangeAllowed: React.Dispatch<SetStateAction<boolean>>;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isOutOfRange: boolean;
    rangeSpanAboveCurrentPrice: number;
    rangeSpanBelowCurrentPrice: number;
}

// central React functional component
export default function RangeCurrencyConverter(props: RangeCurrencyConverterPropsIF) {
    const {
        chainId,
        isLiq,
        tokensBank,
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
        truncatedTokenABalance,
        truncatedTokenBBalance,
        setTokenAInputQty,
        setTokenBInputQty,
        setRangeButtonErrorMessage,
        setRangeAllowed,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        isOutOfRange,
        rangeSpanAboveCurrentPrice,
    } = props;

    const dispatch = useAppDispatch();

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<number>(0);
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<number>(0);

    const tradeData = useAppSelector((state) => state.tradeData);
    // const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
    //     tradeData.isTokenAPrimaryRange,
    // );

    useEffect(() => {
        // console.log(tradeData.isTokenAPrimaryRange);
        // console.log({ isTokenAPrimaryLocal });
        if (tradeData.isTokenAPrimaryRange !== isTokenAPrimaryLocal) {
            if (tradeData.isTokenAPrimaryRange === true) {
                setIsTokenAPrimaryLocal(true);
                // console.log({ tokenAQtyLocal });
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
                        tradeData.primaryQuantityRange === 'NaN'
                            ? ''
                            : tradeData.primaryQuantityRange;
                }
            } else {
                setTokenBQtyLocal(parseFloat(tradeData.primaryQuantityRange));
                setTokenBInputQty(tradeData.primaryQuantityRange);
                const buyQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantityRange === 'NaN'
                            ? ''
                            : tradeData.primaryQuantityRange;
                }
            }
        }
    }, []);

    const setTokenAQtyValue = (value: number) => {
        // console.log({ value });
        setTokenAQtyLocal(value);
        setTokenAInputQty(value.toString());
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
        setTokenBQtyLocal(value);
        setTokenBInputQty(value.toString());

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
            // console.log({ qtyTokenA });
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
        } else if (tokenAAmount > parseFloat(truncatedTokenABalance)) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage(
                `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
            );
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        } else {
            setRangeAllowed(true);
        }
    };

    const handleRangeButtonMessageTokenB = (tokenBAmount: number) => {
        if (poolPriceNonDisplay === 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (tokenBAmount > parseFloat(truncatedTokenBBalance)) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage(
                `${tokenPair.dataTokenB.symbol} Amount Exceeds Wallet Balance`,
            );
        } else if (isNaN(tokenBAmount) || tokenBAmount <= 0) {
            setRangeAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
        } else {
            setRangeAllowed(true);
        }
    };

    const handleTokenAQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            console.log('new handle token A event');
            const input = evt.target.value;
            setTokenAQtyValue(parseFloat(input));
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimaryRange(true));
            dispatch(setPrimaryQuantityRange(input));
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
                        // setTokenAQtyValue(0);
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

    const handleTokenBQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            console.log('new handle token B event');
            const input = evt.target.value;
            setTokenBQtyValue(parseFloat(input));
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimaryRange(false));
            dispatch(setPrimaryQuantityRange(input));
        } else {
            // console.log('updating for token B');
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
                        // setTokenAQtyValue(0);
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
        tradeData.isTokenAPrimaryRange,
        truncatedTokenABalance,
        truncatedTokenBBalance,
        tokenPair,
    ]);

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        chainId: chainId,
        tokenPair: tokenPair,
        tokensBank: tokensBank,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        reverseTokens: reverseTokens,
        truncatedTokenABalance: truncatedTokenABalance,
        truncatedTokenBBalance: truncatedTokenBBalance,
        isTokenADisabled: isTokenADisabled,
        isTokenBDisabled: isTokenBDisabled,
    };

    return (
        <section className={styles.currency_converter}>
            <div className={styles.title}>Collateral</div>
            <RangeCurrencySelector
                fieldId='A'
                updateOtherQuantity={(event) => handleTokenAQtyFieldUpdate(event)}
                {...rangeCurrencySelectorCommonProps}
                isAdvancedMode={isAdvancedMode}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector
                fieldId='B'
                updateOtherQuantity={(event) => handleTokenBQtyFieldUpdate(event)}
                {...rangeCurrencySelectorCommonProps}
                isAdvancedMode={isAdvancedMode}
            />
        </section>
    );
}

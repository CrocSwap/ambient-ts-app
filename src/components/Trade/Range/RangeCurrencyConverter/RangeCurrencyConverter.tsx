// START: Import React and Dongles
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    memo,
    useContext,
} from 'react';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    reverseTokensInRTK,
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
} from '../../../../utils/state/tradeDataSlice';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import { precisionOfInput } from '../../../../App/functions/getPrecisionOfInput';
import tokenArrow from '../../../../assets/images/icons/plus.svg';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

// interface for component props
interface propsIF {
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isLiq?: boolean;
    isAdvancedMode: boolean;
    isTokenABase: boolean;
    isAmbient: boolean;
    depositSkew: number;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    setRangeButtonErrorMessage: Dispatch<SetStateAction<string>>;
    setRangeAllowed: Dispatch<SetStateAction<boolean>>;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isOutOfRange: boolean;
    rangeSpanAboveCurrentPrice: number;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
    setTokenAQtyLocal: Dispatch<SetStateAction<number>>;
    setTokenBQtyLocal: Dispatch<SetStateAction<number>>;
    setTokenAQtyCoveredByWalletBalance: Dispatch<SetStateAction<number>>;
    setTokenBQtyCoveredByWalletBalance: Dispatch<SetStateAction<number>>;
}

// central React functional component
function RangeCurrencyConverter(props: propsIF) {
    const {
        isLiq,
        isTokenABase,
        isAmbient,
        depositSkew,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        tokenAInputQty,
        tokenBInputQty,
        setTokenAInputQty,
        setTokenBInputQty,
        setRangeButtonErrorMessage,
        setRangeAllowed,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        isOutOfRange,
        rangeSpanAboveCurrentPrice,
        tokenAQtyLocal,
        tokenBQtyLocal,
        setTokenAQtyLocal,
        setTokenBQtyLocal,
        setTokenAQtyCoveredByWalletBalance,
        setTokenBQtyCoveredByWalletBalance,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { isPoolInitialized } = useContext(PoolContext);
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

    const dispatch = useAppDispatch();

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const [tokenAAllowed, setTokenAAllowed] = useState(false);
    const [tokenBAllowed, setTokenBAllowed] = useState(false);

    useEffect(() => {
        if (tokenAAllowed && tokenBAllowed) {
            setRangeAllowed(true);
        } else {
            setRangeAllowed(false);
        }
    }, [isOutOfRange, tokenAAllowed, tokenBAllowed]);

    const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;

    const tokenADexBalance = isTokenABase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;

    const tokenBDexBalance = isTokenABase
        ? quoteTokenDexBalance
        : baseTokenDexBalance;

    const tradeData = useAppSelector((state) => state.tradeData);

    const resetTokenQuantities = () => {
        setTokenAQtyLocal(0);
        setTokenAQtyValue(0);
        setTokenBQtyLocal(0);
        setTokenBQtyValue(0);
    };

    const isTokenAEth = tradeData.tokenA.address === ZERO_ADDRESS;
    const isTokenBEth = tradeData.tokenB.address === ZERO_ADDRESS;

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - (tokenAQtyLocal || 0);

    const tokenBSurplusMinusTokenBRemainderNum =
        parseFloat(tokenBDexBalance || '0') - (tokenBQtyLocal || 0);

    const [
        userOverrodeSurplusWithdrawalDefault,
        setUserOverrodeSurplusWithdrawalDefault,
    ] = useState<boolean>(false);

    useEffect(() => {
        if (
            !isWithdrawTokenAFromDexChecked &&
            !userOverrodeSurplusWithdrawalDefault &&
            !!tokenADexBalance &&
            parseFloat(tokenADexBalance) > 0
        ) {
            setIsWithdrawTokenAFromDexChecked(true);
        }
    }, [
        isWithdrawTokenAFromDexChecked,
        userOverrodeSurplusWithdrawalDefault,
        tokenADexBalance,
    ]);

    useEffect(() => {
        if (
            !isWithdrawTokenBFromDexChecked &&
            !userOverrodeSurplusWithdrawalDefault &&
            !!tokenBDexBalance &&
            parseFloat(tokenBDexBalance) > 0
        ) {
            setIsWithdrawTokenBFromDexChecked(true);
        }
    }, [
        isWithdrawTokenBFromDexChecked,
        userOverrodeSurplusWithdrawalDefault,
        tokenBDexBalance,
    ]);

    const primaryQuantityRange = tradeData.primaryQuantityRange;
    const isTokenAPrimaryRange = tradeData.isTokenAPrimaryRange;

    useEffect(() => {
        if (tradeData) {
            if (
                tradeData.isTokenAPrimaryRange &&
                tradeData.primaryQuantityRange
            ) {
                setTokenAInputQty(tradeData.primaryQuantityRange);
                setTokenAQtyValue(parseFloat(tradeData.primaryQuantityRange));
            } else if (tradeData.primaryQuantityRange) {
                IS_LOCAL_ENV &&
                    console.debug(
                        `setting tokenbinputqty to ${tradeData.primaryQuantityRange}`,
                    );
                setTokenBInputQty(tradeData.primaryQuantityRange);
                setTokenBQtyValue(parseFloat(tradeData.primaryQuantityRange));
            }
        }
    }, []);

    const setTokenAQtyValue = (value: number) => {
        const precision = precisionOfInput(value.toString());

        setTokenAQtyLocal(
            parseFloat(truncateDecimals(value, tradeData.tokenA.decimals)),
        );
        setTokenAInputQty(
            value === 0
                ? ''
                : precision <= tradeData.tokenA.decimals
                ? value.toString()
                : truncateDecimals(value, tradeData.tokenA.decimals),
        );

        handleRangeButtonMessageTokenA(value);

        if (tradeData.poolPriceNonDisplay === undefined) return;

        const qtyTokenB =
            calculateSecondaryDepositQty(
                tradeData.poolPriceNonDisplay,
                tradeData.tokenA.decimals,
                tradeData.tokenB.decimals,
                value.toString(),
                true,
                isTokenABase,
                isAmbient,
                depositSkew,
            ) ?? 0;

        handleSecondaryTokenQty('B', value, qtyTokenB);

        const truncatedTokenBQty = qtyTokenB
            ? qtyTokenB < 0.00001
                ? truncateDecimals(qtyTokenB, tradeData.tokenA.decimals)
                : qtyTokenB < 2
                ? qtyTokenB.toPrecision(3)
                : truncateDecimals(qtyTokenB, 2)
            : '';

        if (truncatedTokenBQty !== '0' && truncatedTokenBQty !== '') {
            if (primaryQuantityRange !== value.toString()) {
                dispatch(setPrimaryQuantityRange(value.toString()));
            }
            dispatch(setIsTokenAPrimaryRange(true));
            setTokenBQtyLocal(parseFloat(truncatedTokenBQty));

            setTokenBInputQty(truncatedTokenBQty);
        } else {
            dispatch(setIsTokenAPrimaryRange(true));

            setTokenBQtyLocal(0);

            setTokenBInputQty('');
        }
    };

    const setTokenBQtyValue = (value: number) => {
        const precision = precisionOfInput(value.toString());
        setTokenBQtyLocal(
            parseFloat(truncateDecimals(value, tradeData.tokenB.decimals)),
        );
        setTokenBInputQty(
            value === 0
                ? ''
                : precision <= tradeData.tokenB.decimals
                ? value.toString()
                : truncateDecimals(value, tradeData.tokenB.decimals),
        );

        handleRangeButtonMessageTokenB(value);

        if (tradeData.poolPriceNonDisplay === undefined) return;

        const qtyTokenA =
            calculateSecondaryDepositQty(
                tradeData.poolPriceNonDisplay,
                tradeData.tokenA.decimals,
                tradeData.tokenB.decimals,
                value.toString(),
                false,
                isTokenABase,
                isAmbient,
                depositSkew,
            ) ?? 0;

        handleSecondaryTokenQty('A', value, qtyTokenA);

        const truncatedTokenAQty = qtyTokenA
            ? qtyTokenA < 0.00001
                ? truncateDecimals(qtyTokenA, tradeData.tokenA.decimals)
                : qtyTokenA < 2
                ? qtyTokenA.toPrecision(3)
                : truncateDecimals(qtyTokenA, 2)
            : '';

        if (truncatedTokenAQty !== '0' && truncatedTokenAQty !== '') {
            if (primaryQuantityRange !== value.toString()) {
                dispatch(setPrimaryQuantityRange(value.toString()));
            }
            dispatch(setIsTokenAPrimaryRange(false));
            setTokenAQtyLocal(parseFloat(truncatedTokenAQty));
            setTokenAInputQty(truncatedTokenAQty);
        } else {
            dispatch(setIsTokenAPrimaryRange(false));
            setTokenAQtyLocal(0);
            IS_LOCAL_ENV && console.debug('setting a to blank');
            setTokenAInputQty('');
        }
    };

    // hook to generate navigation actions with pre-loaded path
    const linkGenRange: linkGenMethodsIF = useLinkGen('range');

    const reverseTokens = (): void => {
        dispatch(reverseTokensInRTK());
        resetTokenQuantities();
        linkGenRange.navigate({
            chain: chainId,
            tokenA: tradeData.tokenB.address,
            tokenB: tradeData.tokenA.address,
        });
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryRange));
    };

    const handleRangeButtonMessageTokenA = (tokenAAmount: number) => {
        if (tradeData.poolPriceNonDisplay === 0) {
            setTokenAAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            if (tokenBQtyLocal <= 0) {
                setTokenAAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
            }
        } else {
            if (isWithdrawTokenAFromDexChecked) {
                if (
                    tokenAAmount >
                    parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                ) {
                    setTokenAAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tradeData.tokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setTokenAAllowed(true);
                }
            } else {
                if (tokenAAmount > parseFloat(tokenABalance)) {
                    setTokenAAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tradeData.tokenA.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setTokenAAllowed(true);
                }
            }
        }
    };

    const handleRangeButtonMessageTokenB = (tokenBAmount: number) => {
        if (tradeData.poolPriceNonDisplay === 0) {
            setTokenBAllowed(false);
            setRangeButtonErrorMessage('Invalid Token Pair');
        } else if (isNaN(tokenBAmount) || tokenBAmount <= 0) {
            if (tokenAQtyLocal <= 0) {
                setTokenBAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
            }
        } else {
            if (isWithdrawTokenBFromDexChecked) {
                if (
                    tokenBAmount >
                    parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)
                ) {
                    setTokenBAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tradeData.tokenB.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setTokenBAllowed(true);
                }
            } else {
                if (tokenBAmount > parseFloat(tokenBBalance)) {
                    setTokenBAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tradeData.tokenB.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setTokenBAllowed(true);
                }
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

    const handleTokenAQtyFieldUpdate = (
        evt?: ChangeEvent<HTMLInputElement>,
    ) => {
        if (evt) {
            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            const parsedInput = parseFloat(input);
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setTokenAAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
                setTokenAQtyLocal(0);
                if (input !== '') return;
            }
            setTokenAQtyValue(!isNaN(parsedInput) ? parsedInput : 0);
            dispatch(setIsTokenAPrimaryRange(true));
            dispatch(setPrimaryQuantityRange(input));
            handleRangeButtonMessageTokenA(parseFloat(input));
        } else {
            if (!isOutOfRange) {
                if (tokenAQtyLocal === 0 && tokenBQtyLocal === 0) {
                    setTokenAAllowed(false);
                    setTokenBAllowed(false);
                    setRangeButtonErrorMessage('Enter an Amount');
                } else if (tokenAQtyLocal) setTokenAQtyValue(tokenAQtyLocal);
            } else {
                if (rangeSpanAboveCurrentPrice < 0) {
                    if (isTokenABase) {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                            setTokenBAllowed(true);
                        }
                    } else {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                            setTokenAAllowed(true);
                        }
                    }
                } else {
                    if (isTokenABase) {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                            setTokenAAllowed(true);
                        }
                    } else {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                            setTokenBAllowed(true);
                        }
                    }
                }
            }
        }
    };

    const handleTokenAChangeClick = (input: string) => {
        if (input === '' || parseFloat(input) <= 0) {
            setTokenAAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
            setTokenAQtyValue(0);
        } else {
            setTokenAQtyValue(parseFloat(input));
        }
        dispatch(setIsTokenAPrimaryRange(true));
        dispatch(setPrimaryQuantityRange(input));
        const tokenAField = document.getElementById(
            'A-range-quantity',
        ) as HTMLInputElement;
        if (tokenAField) {
            tokenAField.value = input;
        }
    };

    const handleTokenBChangeClick = (input: string) => {
        if (input === '' || parseFloat(input) <= 0) {
            setTokenBAllowed(false);
            setRangeButtonErrorMessage('Enter an Amount');
            setTokenBQtyValue(0);
        } else {
            setTokenBQtyValue(parseFloat(input));
        }
        dispatch(setIsTokenAPrimaryRange(false));
        dispatch(setPrimaryQuantityRange(input));
        const tokenBField = document.getElementById(
            'B-range-quantity',
        ) as HTMLInputElement;
        if (tokenBField) {
            tokenBField.value = input;
        }
    };

    const handleTokenBQtyFieldUpdate = (
        evt?: ChangeEvent<HTMLInputElement>,
    ) => {
        if (evt) {
            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;
            const parsedInput = parseFloat(input);
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setTokenBAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
                setTokenAQtyLocal(0);
                if (input !== '') return;
            }

            setTokenBQtyValue(!isNaN(parsedInput) ? parsedInput : 0);
            dispatch(setIsTokenAPrimaryRange(false));
            dispatch(setPrimaryQuantityRange(input));
            handleRangeButtonMessageTokenB(parseFloat(input));
        } else {
            if (!isOutOfRange) {
                if (tokenAQtyLocal === 0 && tokenBQtyLocal === 0) {
                    setTokenAAllowed(false);
                    setTokenBAllowed(false);
                } else if (tokenBQtyLocal) setTokenBQtyValue(tokenBQtyLocal);
            } else {
                if (rangeSpanAboveCurrentPrice < 0) {
                    if (isTokenABase) {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                            setTokenBAllowed(true);
                        }
                    } else {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                            setTokenAAllowed(true);
                        }
                    }
                } else {
                    if (isTokenABase) {
                        if (tokenBQtyLocal && tokenBQtyLocal !== 0) {
                            if (tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(false));
                            }
                            setTokenBQtyValue(tokenBQtyLocal);
                            setTokenAAllowed(true);
                        }
                    } else {
                        if (tokenAQtyLocal && tokenAQtyLocal !== 0) {
                            if (!tradeData.isTokenAPrimaryRange) {
                                dispatch(setIsTokenAPrimaryRange(true));
                            }
                            setTokenAQtyValue(tokenAQtyLocal);
                            setTokenBAllowed(true);
                        }
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (isPoolInitialized) {
            tradeData.isTokenAPrimaryRange
                ? handleTokenAQtyFieldUpdate()
                : handleTokenBQtyFieldUpdate();
        }
    }, [
        isPoolInitialized,
        tradeData.poolPriceNonDisplay,
        depositSkew,
        primaryQuantityRange,
        isWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isAdvancedMode,
        isUserConnected,
    ]);

    const tokenAQtyCoveredByWalletBalance = isWithdrawTokenAFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : tokenAQtyLocal;

    const tokenBQtyCoveredByWalletBalance = isWithdrawTokenBFromDexChecked
        ? tokenBSurplusMinusTokenBRemainderNum < 0
            ? tokenBSurplusMinusTokenBRemainderNum * -1
            : 0
        : tokenBQtyLocal;

    useEffect(() => {
        setTokenAQtyCoveredByWalletBalance(tokenAQtyCoveredByWalletBalance);
    }, [tokenAQtyCoveredByWalletBalance]);

    useEffect(() => {
        setTokenBQtyCoveredByWalletBalance(tokenBQtyCoveredByWalletBalance);
    }, [tokenBQtyCoveredByWalletBalance]);

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        isTokenAEth,
        isTokenBEth,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
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
        setUserOverrodeSurplusWithdrawalDefault:
            setUserOverrodeSurplusWithdrawalDefault,
    };

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector
                fieldId='A'
                updateOtherQuantity={(event) =>
                    handleTokenAQtyFieldUpdate(event)
                }
                {...rangeCurrencySelectorCommonProps}
                isAdvancedMode={isAdvancedMode}
                handleChangeClick={handleTokenAChangeClick}
                tokenAorB={'A'}
            />
            <div className={styles.arrow_container}>
                <img src={tokenArrow} alt='plus sign' />
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <div id='range_currency_converter'>
                <RangeCurrencySelector
                    fieldId='B'
                    updateOtherQuantity={(event) =>
                        handleTokenBQtyFieldUpdate(event)
                    }
                    {...rangeCurrencySelectorCommonProps}
                    isAdvancedMode={isAdvancedMode}
                    handleChangeClick={handleTokenBChangeClick}
                    tokenAorB={'B'}
                />
            </div>
        </section>
    );
}

export default memo(RangeCurrencyConverter);

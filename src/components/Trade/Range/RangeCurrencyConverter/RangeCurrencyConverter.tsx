// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
    memo,
    useContext,
} from 'react';

// START: Import React Functional Components
import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
    setRangeTicksCopied,
    setShouldRangeDirectionReverse,
} from '../../../../utils/state/tradeDataSlice';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import tokenArrow from '../../../../assets/images/icons/plus.svg';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import TokenInput from '../../../Global/TokenInput/TokenInput';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

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
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const dispatch = useAppDispatch();

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

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
        setTokenAQtyLocal(
            parseFloat(truncateDecimals(value, tradeData.tokenA.decimals)),
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

        const truncatedTokenBQty = getFormattedNumber({
            value: qtyTokenB,
            isInput: true,
            zeroDisplay: '0',
            nullDisplay: '',
        });

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
        setTokenBQtyLocal(
            parseFloat(truncateDecimals(value, tradeData.tokenB.decimals)),
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

        const truncatedTokenAQty = getFormattedNumber({
            value: qtyTokenA,
            isInput: true,
            zeroDisplay: '0',
            nullDisplay: '',
            removeCommas: true,
        });

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

    const rangeTicksCopied = tradeData.rangeTicksCopied;

    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const reverseTokens = (): void => {
        resetTokenQuantities();
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryRange));
        if (!rangeTicksCopied) {
            linkGenPool.navigate({
                chain: chainId,
                tokenA: tradeData.tokenB.address,
                tokenB: tradeData.tokenA.address,
            });
        }
        if (rangeTicksCopied) dispatch(setRangeTicksCopied(false));
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

    const parseTokenAInput = (value: string) => {
        const inputNum = parseFloat(value);
        const truncatedInputStr = getFormattedNumber({
            value: inputNum,
            isToken: true,
            maxFracDigits: tradeData.tokenA.decimals,
        });

        setTokenAInputQty(truncatedInputStr);
    };

    const parseTokenBInput = (value: string) => {
        const inputNum = parseFloat(value);
        const truncatedInputStr = getFormattedNumber({
            value: inputNum,
            isToken: true,
            maxFracDigits: tradeData.tokenB.decimals,
        });

        setTokenBInputQty(truncatedInputStr);
    };

    const handleTokenAQtyFieldUpdate = (value?: string) => {
        if (value !== undefined) {
            const input = value.startsWith('.') ? '0' + value : value;

            const parsedInput = parseFloat(input);

            setTokenAInputQty(input);
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

    const handleTokenBQtyFieldUpdate = (value?: string) => {
        if (value !== undefined) {
            const input = value.startsWith('.') ? '0' + value : value;
            const parsedInput = parseFloat(input);

            setTokenBInputQty(input);
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
        if (tradeData.shouldRangeDirectionReverse) {
            reverseTokens();
            dispatch(setShouldRangeDirectionReverse(false));
        }
    }, [tradeData.shouldRangeDirectionReverse]);

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

    const toggleDexSelection = (tokenAorB: 'A' | 'B') => {
        if (tokenAorB === 'A') {
            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked);
            if (!!tokenADexBalance && parseFloat(tokenADexBalance) > 0) {
                setUserOverrodeSurplusWithdrawalDefault(true);
            }
        } else {
            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked);
            if (!!tokenBDexBalance && parseFloat(tokenBDexBalance) > 0) {
                setUserOverrodeSurplusWithdrawalDefault(true);
            }
        }
    };

    return (
        <section className={styles.currency_converter}>
            <TokenInput
                tokenAorB='A'
                token={tokenA}
                tokenInput={tokenAInputQty}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={isTokenAEth}
                isDexSelected={isWithdrawTokenAFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenAQtyFieldUpdate}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                parseTokenInput={parseTokenAInput}
                showWallet={isUserConnected}
            />
            <div className={styles.arrow_container}>
                <img src={tokenArrow} height={28} alt='plus sign' />
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <div id='range_currency_converter'>
                <TokenInput
                    tokenAorB='B'
                    token={tokenB}
                    tokenInput={tokenBInputQty}
                    tokenBalance={tokenBBalance}
                    tokenDexBalance={tokenBDexBalance}
                    isTokenEth={isTokenBEth}
                    isDexSelected={isWithdrawTokenBFromDexChecked}
                    showPulseAnimation={showRangePulseAnimation}
                    handleTokenInputEvent={handleTokenBQtyFieldUpdate}
                    reverseTokens={reverseTokens}
                    handleToggleDexSelection={() => toggleDexSelection('B')}
                    parseTokenInput={parseTokenBInput}
                    showWallet={isUserConnected}
                />
            </div>
        </section>
    );
}

export default memo(RangeCurrencyConverter);

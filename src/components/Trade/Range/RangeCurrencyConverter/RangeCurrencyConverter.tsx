// START: Import React and Dongles
import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useState,
    useEffect,
} from 'react';
import { ethers } from 'ethers';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
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
import { useNavigate } from 'react-router-dom';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';
import { precisionOfInput } from '../../../../App/functions/getPrecisionOfInput';
import tokenArrow from '../../../../assets/images/icons/plus.svg';
import { allDexBalanceMethodsIF } from '../../../../App/hooks/useExchangePrefs';
import { ackTokensMethodsIF } from '../../../../App/hooks/useAckTokens';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';

// interface for component props
interface propsIF {
    provider?: ethers.providers.Provider;
    isUserLoggedIn: boolean | undefined;
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
    // setIsTokenAPrimaryLocal: Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    isAmbient: boolean;
    depositSkew: number;
    setIsSellTokenPrimary?: Dispatch<SetStateAction<boolean>>;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
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
    rangeSpanBelowCurrentPrice: number;
    gasPriceInGwei: number | undefined;

    isRangeCopied: boolean;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
    setTokenAQtyLocal: Dispatch<SetStateAction<number>>;
    setTokenBQtyLocal: Dispatch<SetStateAction<number>>;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (
        options?: getRecentTokensParamsIF | undefined,
    ) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    poolExists: boolean | undefined;
    dexBalancePrefs: allDexBalanceMethodsIF;
    ackTokens: ackTokensMethodsIF;
}

// central React functional component
export default function RangeCurrencyConverter(props: propsIF) {
    const {
        poolExists,
        isUserLoggedIn,
        gasPriceInGwei,
        chainId,
        isLiq,
        poolPriceNonDisplay,
        tokenPair,
        isTokenABase,
        isTokenAPrimaryLocal,
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
        isRangeCopied,
        tokenAQtyLocal,
        tokenBQtyLocal,
        setTokenAQtyLocal,
        setTokenBQtyLocal,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        openGlobalPopup,
        ackTokens,
    } = props;

    const dispatch = useAppDispatch();

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

    const tokenASurplusMinusTokenAQtyNum =
        tokenASurplusMinusTokenARemainderNum >= 0
            ? tokenASurplusMinusTokenARemainderNum
            : 0;
    const tokenBSurplusMinusTokenBQtyNum =
        tokenBSurplusMinusTokenBRemainderNum >= 0
            ? tokenBSurplusMinusTokenBRemainderNum
            : 0;

    const tokenAWalletMinusTokenAQtyNum =
        isWithdrawTokenAFromDexChecked &&
        tokenASurplusMinusTokenARemainderNum < 0
            ? parseFloat(tokenABalance || '0') +
              tokenASurplusMinusTokenARemainderNum
            : isWithdrawTokenAFromDexChecked
            ? parseFloat(tokenABalance || '0')
            : parseFloat(tokenABalance || '0') - (tokenAQtyLocal || 0);

    const tokenBWalletMinusTokenAQtyNum =
        isWithdrawTokenBFromDexChecked &&
        tokenBSurplusMinusTokenBRemainderNum < 0
            ? parseFloat(tokenBBalance || '0') +
              tokenBSurplusMinusTokenBRemainderNum
            : isWithdrawTokenBFromDexChecked
            ? parseFloat(tokenBBalance || '0')
            : parseFloat(tokenBBalance || '0') - (tokenBQtyLocal || 0);

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

    useEffect(() => {
        if (tradeData.isTokenAPrimaryRange !== isTokenAPrimaryLocal) {
            if (tradeData.isTokenAPrimaryRange === true) {
                dispatch(setIsTokenAPrimaryRange(true));
                dispatch(setPrimaryQuantityRange(tokenAQtyLocal.toString()));
            } else {
                dispatch(setIsTokenAPrimaryRange(false));
                dispatch(setPrimaryQuantityRange(tokenBQtyLocal.toString()));
            }
        }
    }, [tradeData.isTokenAPrimaryRange]);

    const primaryQuantityRange = tradeData.primaryQuantityRange;

    useEffect(() => {
        if (tradeData) {
            if (tradeData.isTokenAPrimaryRange) {
                setTokenAInputQty(tradeData.primaryQuantityRange);
            } else {
                IS_LOCAL_ENV &&
                    console.debug(
                        `setting tokenbinputqty to ${tradeData.primaryQuantityRange}`,
                    );
                setTokenBInputQty(tradeData.primaryQuantityRange);
            }
        }
    }, []);

    const setTokenAQtyValue = (value: number) => {
        const precision = precisionOfInput(value.toString());

        setTokenAQtyLocal(
            parseFloat(truncateDecimals(value, tokenPair.dataTokenA.decimals)),
        );
        setTokenAInputQty(
            value === 0
                ? ''
                : precision <= tokenPair.dataTokenA.decimals
                ? value.toString()
                : truncateDecimals(value, tokenPair.dataTokenA.decimals),
        );

        handleRangeButtonMessageTokenA(value);

        if (poolPriceNonDisplay === undefined) return;

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

        const truncatedTokenBQty = qtyTokenB
            ? qtyTokenB < 0.00001
                ? truncateDecimals(qtyTokenB, tokenPair.dataTokenA.decimals)
                : qtyTokenB < 2
                ? qtyTokenB.toPrecision(3)
                : truncateDecimals(qtyTokenB, 2)
            : '';

        // const tokenBQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;

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
            parseFloat(truncateDecimals(value, tokenPair.dataTokenB.decimals)),
        );
        setTokenBInputQty(
            value === 0
                ? ''
                : precision <= tokenPair.dataTokenB.decimals
                ? value.toString()
                : truncateDecimals(value, tokenPair.dataTokenB.decimals),
        );

        handleRangeButtonMessageTokenB(value);

        if (poolPriceNonDisplay === undefined) return;

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

        const truncatedTokenAQty = qtyTokenA
            ? qtyTokenA < 0.00001
                ? truncateDecimals(qtyTokenA, tokenPair.dataTokenA.decimals)
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
    const navigate = useNavigate();

    const reverseTokens = (): void => {
        dispatch(reverseTokensInRTK());
        resetTokenQuantities();
        navigate(
            '/trade/range/' +
                formSlugForPairParams(
                    tokenPair.dataTokenA.chainId,
                    tokenPair.dataTokenB,
                    tokenPair.dataTokenA,
                ),
        );
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryLocal));
    };

    const handleRangeButtonMessageTokenA = (tokenAAmount: number) => {
        if (poolPriceNonDisplay === 0) {
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
                        `${tokenPair.dataTokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setTokenAAllowed(true);
                }
            } else {
                if (tokenAAmount > parseFloat(tokenABalance)) {
                    setTokenAAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setTokenAAllowed(true);
                }
            }
        }
    };

    const handleRangeButtonMessageTokenB = (tokenBAmount: number) => {
        if (poolPriceNonDisplay === 0) {
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
                        `${tokenPair.dataTokenB.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setTokenBAllowed(true);
                }
            } else {
                if (tokenBAmount > parseFloat(tokenBBalance)) {
                    setTokenBAllowed(false);
                    setRangeButtonErrorMessage(
                        `${tokenPair.dataTokenB.symbol} Amount Exceeds Wallet Balance`,
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
        if (poolExists) {
            tradeData.isTokenAPrimaryRange
                ? handleTokenAQtyFieldUpdate()
                : handleTokenBQtyFieldUpdate();
        }
    }, [
        poolExists,
        poolPriceNonDisplay,
        depositSkew,
        primaryQuantityRange,
        isWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isAdvancedMode,
        isUserLoggedIn,
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

    const tokenAQtyCoveredBySurplusBalance = isWithdrawTokenAFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum >= 0
            ? tokenAQtyLocal
            : parseFloat(tokenADexBalance || '0')
        : 0;

    const tokenBQtyCoveredBySurplusBalance =
        isWithdrawTokenBFromDexChecked && tokenBQtyLocal > 0
            ? tokenBSurplusMinusTokenBRemainderNum >= 0
                ? tokenBQtyLocal
                : parseFloat(tokenBDexBalance || '0')
            : 0;

    // props for <RangeCurrencyConverter/> React element
    const rangeCurrencySelectorCommonProps = {
        gasPriceInGwei: gasPriceInGwei,
        isUserLoggedIn: isUserLoggedIn,
        resetTokenQuantities: resetTokenQuantities,
        chainId: chainId,
        tokenPair: tokenPair,
        isTokenAEth,
        isTokenBEth,
        tokenAInputQty: tokenAInputQty,
        tokenBInputQty: tokenBInputQty,
        isWithdrawTokenAFromDexChecked: isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked: setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked: isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked: setIsWithdrawTokenBFromDexChecked,
        tokenAWalletMinusTokenAQtyNum: tokenAWalletMinusTokenAQtyNum,
        tokenBWalletMinusTokenBQtyNum: tokenBWalletMinusTokenAQtyNum,
        reverseTokens: reverseTokens,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        tokenADexBalance: tokenADexBalance,
        tokenBDexBalance: tokenBDexBalance,
        isTokenADisabled: isTokenADisabled,
        isTokenBDisabled: isTokenBDisabled,
        tokenAQtyLocal: tokenAQtyLocal,
        tokenBQtyLocal: tokenBQtyLocal,
        tokenAQtyCoveredByWalletBalance: tokenAQtyCoveredByWalletBalance,
        tokenBQtyCoveredByWalletBalance: tokenBQtyCoveredByWalletBalance,
        tokenAQtyCoveredBySurplusBalance: tokenAQtyCoveredBySurplusBalance,
        tokenBQtyCoveredBySurplusBalance: tokenBQtyCoveredBySurplusBalance,
        tokenASurplusMinusTokenARemainderNum:
            tokenASurplusMinusTokenARemainderNum,
        tokenBSurplusMinusTokenBRemainderNum:
            tokenBSurplusMinusTokenBRemainderNum,
        tokenASurplusMinusTokenAQtyNum: tokenASurplusMinusTokenAQtyNum,
        tokenBSurplusMinusTokenBQtyNum: tokenBSurplusMinusTokenBQtyNum,
        isRangeCopied: isRangeCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: importedTokensPlus,
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        openGlobalPopup: openGlobalPopup,
        ackTokens: ackTokens,
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

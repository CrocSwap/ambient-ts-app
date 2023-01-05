// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// START: Import React Functional Components
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import Local Files
import styles from './RangeCurrencyConverter.module.css';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    reverseTokensInRTK,
    setIsTokenAPrimaryRange,
    setPrimaryQuantityRange,
} from '../../../../utils/state/tradeDataSlice';
import { ZERO_ADDRESS } from '../../../../constants';
import { useNavigate } from 'react-router-dom';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';

// interface for component props
interface RangeCurrencyConverterPropsIF {
    provider?: ethers.providers.Provider;
    isUserLoggedIn: boolean | undefined;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
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
    gasPriceInGwei: number | undefined;

    isRangeCopied: boolean;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
    setTokenAQtyLocal: Dispatch<SetStateAction<number>>;
    setTokenBQtyLocal: Dispatch<SetStateAction<number>>;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
}

// central React functional component
export default function RangeCurrencyConverter(props: RangeCurrencyConverterPropsIF) {
    const {
        isUserLoggedIn,
        gasPriceInGwei,
        chainId,
        isLiq,
        tokensBank,
        setImportedTokens,
        poolPriceNonDisplay,
        tokenPair,
        isTokenABase,
        isTokenAPrimaryLocal,
        // setIsTokenAPrimaryLocal,
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
    const tokenADexBalance = isTokenABase ? baseTokenDexBalance : quoteTokenDexBalance;
    const tokenBDexBalance = isTokenABase ? quoteTokenDexBalance : baseTokenDexBalance;

    const tradeData = useAppSelector((state) => state.tradeData);

    // const tokens = {
    //     baseToken: tradeData.baseToken.address,
    //     quoteToken: tradeData.quoteToken.address,
    // };

    const resetTokenQuantities = () => {
        setTokenAQtyLocal(0);
        setTokenAQtyValue(0);
        setTokenBQtyLocal(0);
        setTokenBQtyValue(0);
    };

    // useEffect(() => {
    //     resetTokenQuantities();
    // }, [JSON.stringify(tokens)]);

    const isTokenAEth = tradeData.tokenA.address === ZERO_ADDRESS;
    const isTokenBEth = tradeData.tokenB.address === ZERO_ADDRESS;

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - (tokenAQtyLocal || 0);

    const tokenBSurplusMinusTokenBRemainderNum =
        parseFloat(tokenBDexBalance || '0') - (tokenBQtyLocal || 0);

    const tokenASurplusMinusTokenAQtyNum =
        tokenASurplusMinusTokenARemainderNum >= 0 ? tokenASurplusMinusTokenARemainderNum : 0;
    const tokenBSurplusMinusTokenBQtyNum =
        tokenBSurplusMinusTokenBRemainderNum >= 0 ? tokenBSurplusMinusTokenBRemainderNum : 0;
    //  const tokenASurplusMinusTokenAQtyNum =
    //      tokenASurplusMinusTokenARemainderNum >= 0 ? tokenASurplusMinusTokenARemainderNum : 0;

    const tokenAWalletMinusTokenAQtyNum = isTokenAEth
        ? isWithdrawTokenAFromDexChecked
            ? parseFloat(tokenABalance || '0')
            : parseFloat(tokenABalance || '0') - (tokenAQtyLocal || 0)
        : isWithdrawTokenAFromDexChecked && tokenASurplusMinusTokenARemainderNum < 0
        ? parseFloat(tokenABalance || '0') + tokenASurplusMinusTokenARemainderNum
        : isWithdrawTokenAFromDexChecked
        ? parseFloat(tokenABalance || '0')
        : parseFloat(tokenABalance || '0') - (tokenAQtyLocal || 0);

    const tokenBWalletMinusTokenAQtyNum = isTokenAEth
        ? isWithdrawTokenBFromDexChecked
            ? parseFloat(tokenBBalance || '0')
            : parseFloat(tokenBBalance || '0') - (tokenBQtyLocal || 0)
        : isWithdrawTokenBFromDexChecked && tokenBSurplusMinusTokenBRemainderNum < 0
        ? parseFloat(tokenBBalance || '0') + tokenBSurplusMinusTokenBRemainderNum
        : isWithdrawTokenBFromDexChecked
        ? parseFloat(tokenBBalance || '0')
        : parseFloat(tokenBBalance || '0') - (tokenBQtyLocal || 0);

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
        setTokenAQtyLocal(parseFloat(truncateDecimals(value, tokenPair.dataTokenA.decimals)));
        // console.log({ value });
        if (value === 0) {
            setTokenAInputQty('');
        } else {
            setTokenAInputQty(truncateDecimals(value, tokenPair.dataTokenA.decimals));
        }
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

        const tokenBQtyField = document.getElementById('B-range-quantity') as HTMLInputElement;

        if (truncatedTokenBQty !== '0' && truncatedTokenBQty !== '') {
            tokenBQtyField.value = truncatedTokenBQty;
            if (primaryQuantityRange !== value.toString()) {
                dispatch(setPrimaryQuantityRange(value.toString()));
            }
            dispatch(setIsTokenAPrimaryRange(true));
            setTokenBQtyLocal(parseFloat(truncatedTokenBQty));
            setTokenBInputQty(truncatedTokenBQty);
        } else {
            tokenBQtyField.value = '';
            dispatch(setIsTokenAPrimaryRange(true));

            setTokenBQtyLocal(0);
            setTokenBInputQty('');
        }
    };

    const setTokenBQtyValue = (value: number) => {
        setTokenBQtyLocal(parseFloat(truncateDecimals(value, tokenPair.dataTokenB.decimals)));
        if (value === 0) {
            setTokenBInputQty('');
        } else {
            setTokenBInputQty(truncateDecimals(value, tokenPair.dataTokenA.decimals));
        }
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

        const tokenAQtyField = document.getElementById('A-range-quantity') as HTMLInputElement;
        if (truncatedTokenAQty !== '0' && truncatedTokenAQty !== '') {
            tokenAQtyField.value = truncatedTokenAQty;
            if (primaryQuantityRange !== value.toString()) {
                dispatch(setPrimaryQuantityRange(value.toString()));
            }
            dispatch(setIsTokenAPrimaryRange(false));
            setTokenAQtyLocal(parseFloat(truncatedTokenAQty));
            setTokenAInputQty(truncatedTokenAQty);
        } else {
            tokenAQtyField.value = '';
            dispatch(setIsTokenAPrimaryRange(false));
            setTokenAQtyLocal(0);
            setTokenAInputQty('');
        }
    };
    const navigate = useNavigate();

    const reverseTokens = (): void => {
        dispatch(reverseTokensInRTK());
        resetTokenQuantities();
        navigate(
            '/trade/range/chain=0x5&tokenA=' +
                tokenPair.dataTokenB.address +
                '&tokenB=' +
                tokenPair.dataTokenA.address,
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
            if (isTokenAEth) {
                if (isWithdrawTokenAFromDexChecked) {
                    const roundedTokenADexBalance =
                        Math.floor(parseFloat(tokenADexBalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenADexBalance) {
                        setTokenAAllowed(false);
                        setRangeButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Exchange Surplus Balance`,
                        );
                    } else {
                        setTokenAAllowed(true);
                    }
                } else {
                    const roundedTokenAWalletBalance =
                        Math.floor(parseFloat(tokenABalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenAWalletBalance) {
                        setTokenAAllowed(false);
                        setRangeButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Wallet Balance`,
                        );
                    } else {
                        setTokenAAllowed(true);
                    }
                }
            } else {
                if (isWithdrawTokenAFromDexChecked) {
                    if (tokenAAmount > parseFloat(tokenADexBalance) + parseFloat(tokenABalance)) {
                        setTokenAAllowed(false);
                        setRangeButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Exceeds Combined Wallet and Exchange Surplus Balance`,
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
            if (isTokenBEth) {
                if (isWithdrawTokenBFromDexChecked) {
                    const roundedTokenBDexBalance =
                        Math.floor(parseFloat(tokenBDexBalance) * 1000) / 1000;
                    if (tokenBAmount >= roundedTokenBDexBalance) {
                        setTokenBAllowed(false);
                        setRangeButtonErrorMessage(
                            `${tokenPair.dataTokenB.symbol} Amount Must Be Less Than Exchange Surplus Balance`,
                        );
                    } else {
                        setTokenBAllowed(true);
                    }
                } else {
                    const roundedTokenBWalletBalance =
                        Math.floor(parseFloat(tokenBBalance) * 1000) / 1000;
                    if (tokenBAmount >= roundedTokenBWalletBalance) {
                        setTokenBAllowed(false);
                        setRangeButtonErrorMessage(
                            `${tokenPair.dataTokenB.symbol} Amount Must Be Less Than Wallet Balance`,
                        );
                    } else {
                        setTokenBAllowed(true);
                    }
                }
            } else {
                if (isWithdrawTokenBFromDexChecked) {
                    if (tokenBAmount > parseFloat(tokenBDexBalance) + parseFloat(tokenBBalance)) {
                        setTokenBAllowed(false);
                        setRangeButtonErrorMessage(
                            `${tokenPair.dataTokenB.symbol} Amount Exceeds Combined Wallet and Exchange Surplus Balance`,
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
            const tokenAInputField = document.getElementById('A-range-quantity');

            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            if (tokenAInputField) {
                (tokenAInputField as HTMLInputElement).value = input;
            }
            if (input === '' || isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
                setTokenAAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
                setTokenAQtyValue(0);
            } else {
                setTokenAQtyValue(parseFloat(input));
            }
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
        const tokenAField = document.getElementById('A-range-quantity') as HTMLInputElement;
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
        const tokenBField = document.getElementById('B-range-quantity') as HTMLInputElement;
        if (tokenBField) {
            tokenBField.value = input;
        }
    };

    const handleTokenBQtyFieldUpdate = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const tokenBInputField = document.getElementById('B-range-quantity');

            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            if (tokenBInputField) {
                (tokenBInputField as HTMLInputElement).value = input;
            }
            if (input === '' || isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
                setTokenBAllowed(false);
                setRangeButtonErrorMessage('Enter an Amount');
                setTokenBQtyValue(0);
            } else {
                setTokenBQtyValue(parseFloat(input));
            }
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

    // const isQtyEntered = tokenAInputQty !== '' && tokenBInputQty !== '';

    useEffect(() => {
        tradeData.isTokenAPrimaryRange
            ? handleTokenAQtyFieldUpdate()
            : handleTokenBQtyFieldUpdate();
    }, [
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
        tokensBank: tokensBank,
        setImportedTokens: setImportedTokens,
        isTokenAEth,
        isTokenBEth,
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
        tokenASurplusMinusTokenARemainderNum: tokenASurplusMinusTokenARemainderNum,
        tokenBSurplusMinusTokenBRemainderNum: tokenBSurplusMinusTokenBRemainderNum,
        tokenASurplusMinusTokenAQtyNum: tokenASurplusMinusTokenAQtyNum,
        tokenBSurplusMinusTokenBQtyNum: tokenBSurplusMinusTokenBQtyNum,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        isRangeCopied: isRangeCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: importedTokensPlus,
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
    };

    return (
        <section className={styles.currency_converter}>
            <div className={styles.title}> </div>
            <RangeCurrencySelector
                fieldId='A'
                updateOtherQuantity={(event) => handleTokenAQtyFieldUpdate(event)}
                {...rangeCurrencySelectorCommonProps}
                isAdvancedMode={isAdvancedMode}
                handleChangeClick={handleTokenAChangeClick}
                tokenAorB={'A'}
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
                tokenAorB={'B'}
            />
        </section>
    );
}

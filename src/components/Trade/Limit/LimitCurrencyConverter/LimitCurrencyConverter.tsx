// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';

import {
    setTokenA,
    setTokenB,
    setIsTokenAPrimary,
    setPrimaryQuantity,
} from '../../../../utils/state/tradeDataSlice';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import React Functional Components
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';
import LimitRate from '../LimitRate/LimitRate';

// START: Import Local Files
import styles from './LimitCurrencyConverter.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';
import DividerDark from '../../../Global/DividerDark/DividerDark';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { ZERO_ADDRESS } from '../../../../constants';

// interface for component props
interface LimitCurrencyConverterProps {
    isUserLoggedIn: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    poolPriceNonDisplay: number | undefined;
    insideTickDisplayPrice: number;
    setIsSellTokenPrimary?: Dispatch<SetStateAction<boolean>>;
    setLimitAllowed: Dispatch<SetStateAction<boolean>>;
    isSellTokenBase: boolean;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    setLimitButtonErrorMessage: Dispatch<SetStateAction<string>>;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    // priceInputOnBlur: () => void;
    isDenominationInBase: boolean;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencyConverter(props: LimitCurrencyConverterProps) {
    const {
        isUserLoggedIn,
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        poolPriceNonDisplay,
        insideTickDisplayPrice,
        setLimitAllowed,
        isSellTokenBase,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        setTokenAInputQty,
        setTokenBInputQty,
        setLimitButtonErrorMessage,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        // priceInputOnBlur,
        isDenominationInBase,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    const dispatch = useAppDispatch();

    const limitRateNumber = insideTickDisplayPrice;

    const tradeData = useAppSelector((state) => state.tradeData);

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );
    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );

    const isSellTokenEth = tradeData.tokenA.address === ZERO_ADDRESS;

    const tokenABalance = isSellTokenBase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isSellTokenBase ? quoteTokenBalance : baseTokenBalance;
    const tokenADexBalance = isSellTokenBase ? baseTokenDexBalance : quoteTokenDexBalance;
    const tokenBDexBalance = isSellTokenBase ? quoteTokenDexBalance : baseTokenDexBalance;

    // const tokenADecimals = tokenPair.dataTokenA.decimals;
    // const tokenBDecimals = tokenPair.dataTokenB.decimals;

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAQtyLocal || '0');
    const tokenASurplusMinusTokenAQtyNum =
        tokenASurplusMinusTokenARemainderNum >= 0 ? tokenASurplusMinusTokenARemainderNum : 0;
    const tokenAWalletMinusTokenAQtyNum = isSellTokenEth
        ? isWithdrawFromDexChecked
            ? parseFloat(tokenABalance || '0')
            : parseFloat(tokenABalance || '0') - parseFloat(tokenAQtyLocal || '0')
        : isWithdrawFromDexChecked && tokenASurplusMinusTokenARemainderNum < 0
        ? parseFloat(tokenABalance || '0') + tokenASurplusMinusTokenARemainderNum
        : isWithdrawFromDexChecked
        ? parseFloat(tokenABalance || '0')
        : parseFloat(tokenABalance || '0') - parseFloat(tokenAQtyLocal || '0');
    // TODO: pass tokenPair to <LimitRate /> as a prop such that we can use a dynamic
    // TODO: ... logo instead of the hardcoded one it contains

    useEffect(() => {
        if (tradeData) {
            if (isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
                const sellQtyField = document.getElementById(
                    'sell-limit-quantity',
                ) as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            } else {
                setTokenBQtyLocal(tradeData.primaryQuantity);
                setTokenBInputQty(tradeData.primaryQuantity);
                const buyQtyField = document.getElementById(
                    'buy-limit-quantity',
                ) as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            }
        }
    }, []);

    const handleArrowClick = (): void => {
        reverseTokens();
    };

    const reverseTokens = (): void => {
        if (tokenPair) {
            dispatch(setTokenA(tokenPair.dataTokenB));
            dispatch(setTokenB(tokenPair.dataTokenA));
        }
        if (!isTokenAPrimaryLocal) {
            setTokenAQtyLocal(tokenBQtyLocal);
            setTokenAInputQty(tokenBQtyLocal);
            const sellQtyField = document.getElementById('sell-limit-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal;
            }
        } else {
            setTokenBQtyLocal(tokenAQtyLocal);
            setTokenBInputQty(tokenAQtyLocal);
            const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;
            if (buyQtyField) {
                buyQtyField.value = tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal;
            }
        }
        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        dispatch(setIsTokenAPrimary(!isTokenAPrimaryLocal));
    };

    useEffect(() => {
        isTokenAPrimaryLocal ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
    }, [
        limitRateNumber,
        isSellTokenBase,
        isTokenAPrimaryLocal,
        tokenABalance,
        isWithdrawFromDexChecked,
    ]);

    const handleLimitButtonMessage = (tokenAAmount: number) => {
        if (limitRateNumber === 0 || poolPriceNonDisplay === 0) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Invalid Token Pair');
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Enter an Amount');
        } else {
            if (isSellTokenEth) {
                if (isWithdrawFromDexChecked) {
                    const roundedTokenADexBalance =
                        Math.floor(parseFloat(tokenADexBalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenADexBalance) {
                        setLimitAllowed(false);
                        setLimitButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Exchange Surplus Balance`,
                        );
                    } else {
                        setLimitAllowed(true);
                    }
                } else {
                    const roundedTokenAWalletBalance =
                        Math.floor(parseFloat(tokenABalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenAWalletBalance) {
                        setLimitAllowed(false);
                        setLimitButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Wallet Balance`,
                        );
                    } else {
                        setLimitAllowed(true);
                    }
                }
            } else {
                if (isWithdrawFromDexChecked) {
                    if (tokenAAmount > parseFloat(tokenADexBalance) + parseFloat(tokenABalance)) {
                        setLimitAllowed(false);
                        setLimitButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Exceeds Combined Wallet and Exchange Surplus Balance`,
                        );
                    } else {
                        setLimitAllowed(true);
                    }
                } else {
                    if (tokenAAmount > parseFloat(tokenABalance)) {
                        setLimitAllowed(false);
                        setLimitButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
                        );
                    } else {
                        setLimitAllowed(true);
                    }
                }
            }
        }
    };

    const handleTokenAChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenBQty: number;

        if (evt) {
            const input = evt.target.value;
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));

            if (!isDenominationInBase) {
                rawTokenBQty = isSellTokenBase
                    ? (1 / limitRateNumber) * parseFloat(input)
                    : limitRateNumber * parseFloat(input);
            } else {
                rawTokenBQty = !isSellTokenBase
                    ? (1 / limitRateNumber) * parseFloat(input)
                    : limitRateNumber * parseFloat(input);
            }

            handleLimitButtonMessage(parseFloat(input));
        } else {
            if (!isDenominationInBase) {
                rawTokenBQty = isSellTokenBase
                    ? (1 / limitRateNumber) * parseFloat(tokenAQtyLocal)
                    : limitRateNumber * parseFloat(tokenAQtyLocal);
            } else {
                rawTokenBQty = !isSellTokenBase
                    ? (1 / limitRateNumber) * parseFloat(tokenAQtyLocal)
                    : limitRateNumber * parseFloat(tokenAQtyLocal);
            }

            handleLimitButtonMessage(parseFloat(tokenAQtyLocal));
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 100000
                ? rawTokenBQty.toPrecision(6)
                : truncateDecimals(rawTokenBQty, 0)
            : '';

        setTokenBQtyLocal(truncatedTokenBQty);
        // setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };

    const handleTokenAChangeClick = (value: string) => {
        let rawTokenBQty;
        const tokenAInputField = document.getElementById('sell-limit-quantity');
        if (tokenAInputField) {
            (tokenAInputField as HTMLInputElement).value = value;
        }
        const input = value;
        setTokenAQtyLocal(input);
        setTokenAInputQty(input);
        setIsTokenAPrimaryLocal(true);
        dispatch(setIsTokenAPrimary(true));
        dispatch(setPrimaryQuantity(input));

        if (!isDenominationInBase) {
            rawTokenBQty = isSellTokenBase
                ? (1 / limitRateNumber) * parseFloat(input)
                : limitRateNumber * parseFloat(input);
        } else {
            rawTokenBQty = !isSellTokenBase
                ? (1 / limitRateNumber) * parseFloat(input)
                : limitRateNumber * parseFloat(input);
        }

        handleLimitButtonMessage(parseFloat(input));
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 100000
                ? rawTokenBQty.toPrecision(6)
                : truncateDecimals(rawTokenBQty, 0)
            : '';

        // const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        // setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };

    const handleTokenBChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenAQty;

        if (evt) {
            const input = evt.target.value;
            setTokenBQtyLocal(input);
            setTokenBInputQty(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            if (!isDenominationInBase) {
                rawTokenAQty = isSellTokenBase
                    ? limitRateNumber * parseFloat(input)
                    : (1 / limitRateNumber) * parseFloat(input);
            } else {
                rawTokenAQty = !isSellTokenBase
                    ? limitRateNumber * parseFloat(input)
                    : (1 / limitRateNumber) * parseFloat(input);
            }

            // rawTokenAQty = isDenominationInBase
            //     ? (1 / limitRateNumber) * parseFloat(input)
            //     : limitRateNumber * parseFloat(input);
        } else {
            if (!isDenominationInBase) {
                rawTokenAQty = isSellTokenBase
                    ? limitRateNumber * parseFloat(tokenBQtyLocal)
                    : (1 / limitRateNumber) * parseFloat(tokenBQtyLocal);
            } else {
                rawTokenAQty = !isSellTokenBase
                    ? limitRateNumber * parseFloat(tokenBQtyLocal)
                    : (1 / limitRateNumber) * parseFloat(tokenBQtyLocal);
            }
        }
        handleLimitButtonMessage(rawTokenAQty);
        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 100000
                ? rawTokenAQty.toPrecision(6)
                : truncateDecimals(rawTokenAQty, 0)
            : '';
        setTokenAQtyLocal(truncatedTokenAQty);
        // setTokenAInputQty(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-limit-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
        }
    };

    const tokenAQtyCoveredBySurplusBalance = isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum >= 0
            ? parseFloat(tokenAQtyLocal || '0')
            : parseFloat(tokenADexBalance || '0')
        : 0;

    const tokenAQtyCoveredByWalletBalance = isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(tokenAQtyLocal || '0');

    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector
                isUserLoggedIn={isUserLoggedIn}
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                searchableTokens={searchableTokens}
                chainId={chainId}
                fieldId='sell'
                sellToken
                isSellTokenEth={isSellTokenEth}
                direction='From: '
                handleChangeEvent={handleTokenAChangeEvent}
                handleChangeClick={handleTokenAChangeClick}
                reverseTokens={reverseTokens}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                tokenADexBalance={tokenADexBalance}
                tokenBDexBalance={tokenBDexBalance}
                tokenAQtyCoveredByWalletBalance={tokenAQtyCoveredByWalletBalance}
                tokenAQtyCoveredBySurplusBalance={tokenAQtyCoveredBySurplusBalance}
                tokenAWalletMinusTokenAQtyNum={tokenAWalletMinusTokenAQtyNum}
                tokenASurplusMinusTokenAQtyNum={tokenASurplusMinusTokenAQtyNum}
                tokenASurplusMinusTokenARemainderNum={tokenASurplusMinusTokenARemainderNum}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />

            <div
                className={styles.arrow_container}
                onClick={handleArrowClick}
                style={{ cursor: 'pointer' }}
            >
                <IconWithTooltip title='Reverse tokens' placement='left'>
                    <TokensArrow />
                </IconWithTooltip>
            </div>
            <LimitCurrencySelector
                isUserLoggedIn={isUserLoggedIn}
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                searchableTokens={searchableTokens}
                chainId={chainId}
                fieldId='buy'
                direction='To: '
                handleChangeEvent={handleTokenBChangeEvent}
                reverseTokens={reverseTokens}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                tokenADexBalance={tokenADexBalance}
                tokenBDexBalance={tokenBDexBalance}
                tokenAQtyCoveredByWalletBalance={tokenAQtyCoveredByWalletBalance}
                tokenAQtyCoveredBySurplusBalance={tokenAQtyCoveredBySurplusBalance}
                tokenAWalletMinusTokenAQtyNum={tokenAWalletMinusTokenAQtyNum}
                tokenASurplusMinusTokenAQtyNum={tokenASurplusMinusTokenAQtyNum}
                tokenASurplusMinusTokenARemainderNum={tokenASurplusMinusTokenARemainderNum}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
            <DividerDark addMarginTop />
            <LimitRate
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                chainId={chainId}
                fieldId='limit-rate'
                reverseTokens={reverseTokens}
                // onBlur={priceInputOnBlur}
                poolPriceNonDisplay={poolPriceNonDisplay}
                insideTickDisplayPrice={insideTickDisplayPrice}
            />
        </section>
    );
}

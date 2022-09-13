import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import {
    setTokenA,
    setTokenB,
    setIsTokenAPrimary,
    setPrimaryQuantity,
} from '../../../utils/state/tradeDataSlice';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { calcImpact } from '../../../App/functions/calcImpact';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { ZERO_ADDRESS } from '../../../constants';
interface CurrencyConverterPropsIF {
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    slippageTolerancePercentage: number;
    setPriceImpact: Dispatch<SetStateAction<CrocImpact | undefined>>;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    isLiq: boolean;
    poolPriceDisplay: number | undefined;
    isTokenAPrimary: boolean;
    nativeBalance: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    setSwapAllowed: Dispatch<SetStateAction<boolean>>;
    setSwapButtonErrorMessage: Dispatch<SetStateAction<string>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function CurrencyConverter(props: CurrencyConverterPropsIF) {
    const {
        crocEnv,
        // provider,
        slippageTolerancePercentage,
        setPriceImpact,
        tokenPair,
        // isSellTokenBase,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        isLiq,
        poolPriceDisplay,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        setSwapAllowed,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        setSwapButtonErrorMessage,
        setTokenAInputQty,
        setTokenBInputQty,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isSellTokenEth = tradeData.tokenA.address === ZERO_ADDRESS;
    const isSellTokenBase = tradeData.baseToken.address === tradeData.tokenA.address;

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );
    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );

    const userHasEnteredAmount = tokenAQtyLocal !== '';

    const tokenABalance = isSellTokenBase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isSellTokenBase ? quoteTokenBalance : baseTokenBalance;
    const tokenADexBalance = isSellTokenBase ? baseTokenDexBalance : quoteTokenDexBalance;
    const tokenBDexBalance = isSellTokenBase ? quoteTokenDexBalance : baseTokenDexBalance;

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

    const tokenBWalletPlusTokenBQtyNum =
        parseFloat(tokenBBalance || '0') + parseFloat(tokenBQtyLocal || '0');
    const tokenBSurplusPlusTokenBQtyNum =
        parseFloat(tokenBDexBalance || '0') + parseFloat(tokenBQtyLocal || '0');

    useEffect(() => {
        if (tradeData && crocEnv) {
            if (tradeData.isTokenAPrimary) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
                const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            } else {
                setTokenBQtyLocal(tradeData.primaryQuantity);
                setTokenBInputQty(tradeData.primaryQuantity);
                const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            }
        }
    }, [crocEnv]);

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
            const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal;
            }
        } else {
            setTokenBQtyLocal(tokenAQtyLocal);
            setTokenBInputQty(tokenAQtyLocal);
            const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
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
        crocEnv,
        poolPriceDisplay,
        isSellTokenBase,
        isTokenAPrimaryLocal,
        tokenABalance,
        isWithdrawFromDexChecked,
        // isSellTokenEth,
    ]);

    const handleSwapButtonMessage = (tokenAAmount: number) => {
        if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Invalid Token Pair');
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else {
            if (isSellTokenEth) {
                if (isWithdrawFromDexChecked) {
                    const roundedTokenADexBalance =
                        Math.floor(parseFloat(tokenADexBalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenADexBalance) {
                        setSwapAllowed(false);
                        setSwapButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Exchange Surplus Balance`,
                        );
                    } else {
                        setSwapAllowed(true);
                    }
                } else {
                    const roundedTokenAWalletBalance =
                        Math.floor(parseFloat(tokenABalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenAWalletBalance) {
                        setSwapAllowed(false);
                        setSwapButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Wallet Balance`,
                        );
                    } else {
                        setSwapAllowed(true);
                    }
                }
            } else {
                if (isWithdrawFromDexChecked) {
                    if (tokenAAmount > parseFloat(tokenADexBalance) + parseFloat(tokenABalance)) {
                        setSwapAllowed(false);
                        setSwapButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Exceeds Combined Wallet and Exchange Surplus Balance`,
                        );
                    } else {
                        setSwapAllowed(true);
                    }
                } else {
                    if (tokenAAmount > parseFloat(tokenABalance)) {
                        setSwapAllowed(false);
                        setSwapButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
                        );
                    } else {
                        setSwapAllowed(true);
                    }
                }
            }
        }
    };

    const handleTokenAChangeEvent = async (evt?: ChangeEvent<HTMLInputElement>) => {
        if (!poolPriceDisplay) return;
        if (!crocEnv) return;
        let rawTokenBQty;

        if (evt) {
            const input = evt.target.value;
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));

            const impact =
                input !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          input,
                      )
                    : undefined;

            impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        } else {
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));

            const impact =
                tokenAQtyLocal !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          tokenAQtyLocal,
                      )
                    : undefined;

            impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 100000
                ? rawTokenBQty.toPrecision(6)
                : truncateDecimals(rawTokenBQty, 0)
            : '';
        // const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };

    const handleTokenAChangeClick = async (value: string) => {
        if (!poolPriceDisplay) return;
        if (!crocEnv) return;
        let rawTokenBQty;
        const tokenAInputField = document.getElementById('sell-quantity');
        if (tokenAInputField) {
            (tokenAInputField as HTMLInputElement).value = value;
        }
        if (value) {
            const input = value;
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));

            const impact =
                input !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          input,
                      )
                    : undefined;
            impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        } else {
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));

            const impact =
                tokenAQtyLocal !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          tokenAQtyLocal,
                      )
                    : undefined;
            impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 100000
                ? rawTokenBQty.toPrecision(6)
                : truncateDecimals(rawTokenBQty, 0)
            : '';

        setTokenBQtyLocal(truncatedTokenBQty);
        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };

    const handleTokenBChangeEvent = async (evt?: ChangeEvent<HTMLInputElement>) => {
        if (!poolPriceDisplay) return;
        if (!crocEnv) return;

        let rawTokenAQty;

        if (evt) {
            const input = evt.target.value;
            setTokenBQtyLocal(input);
            setTokenBInputQty(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            const impact =
                input !== ''
                    ? await calcImpact(
                          false,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          input,
                      )
                    : undefined;
            impact ? setPriceImpact(impact) : null;

            rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;

            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
        } else {
            const impact =
                tokenBQtyLocal !== ''
                    ? await calcImpact(
                          false,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          tokenBQtyLocal,
                      )
                    : undefined;
            impact ? setPriceImpact(impact) : null;

            rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;
            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
        }

        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 100000
                ? rawTokenAQty.toPrecision(6)
                : truncateDecimals(rawTokenAQty, 0)
            : '';

        setTokenAQtyLocal(truncatedTokenAQty);
        setTokenAInputQty(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
        }
    };

    return (
        <section className={styles.currency_converter}>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                searchableTokens={searchableTokens}
                setImportedTokens={setImportedTokens}
                chainId={chainId}
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                sellToken
                userHasEnteredAmount={userHasEnteredAmount}
                handleChangeEvent={handleTokenAChangeEvent}
                handleChangeClick={handleTokenAChangeClick}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                tokenADexBalance={tokenADexBalance}
                tokenBDexBalance={tokenBDexBalance}
                isSellTokenEth={isSellTokenEth}
                tokenASurplusMinusTokenARemainderNum={tokenASurplusMinusTokenARemainderNum}
                tokenAWalletMinusTokenAQtyNum={tokenAWalletMinusTokenAQtyNum}
                tokenBWalletPlusTokenBQtyNum={tokenBWalletPlusTokenBQtyNum}
                tokenASurplusMinusTokenAQtyNum={tokenASurplusMinusTokenAQtyNum}
                tokenBSurplusPlusTokenBQtyNum={tokenBSurplusPlusTokenBQtyNum}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                reverseTokens={reverseTokens}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
            <div className={styles.arrow_container} onClick={handleArrowClick}>
                {/* <img src={tokensArrowImage} alt="arrow pointing down" /> */}
                {/* {isLiq ? null : <span className={styles.arrow} />} */}
                {isLiq ? null : (
                    <IconWithTooltip title='Reverse tokens' placement='left'>
                        <TokensArrow />
                    </IconWithTooltip>
                )}
            </div>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                searchableTokens={searchableTokens}
                chainId={chainId}
                direction={isLiq ? '' : 'To:'}
                fieldId='buy'
                userHasEnteredAmount={userHasEnteredAmount}
                handleChangeEvent={handleTokenBChangeEvent}
                // handleChangeClick={handleTokenBChangeClick}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                tokenADexBalance={tokenADexBalance}
                tokenBDexBalance={tokenBDexBalance}
                tokenAWalletMinusTokenAQtyNum={tokenAWalletMinusTokenAQtyNum}
                tokenBWalletPlusTokenBQtyNum={tokenBWalletPlusTokenBQtyNum}
                tokenASurplusMinusTokenAQtyNum={tokenASurplusMinusTokenAQtyNum}
                tokenBSurplusPlusTokenBQtyNum={tokenBSurplusPlusTokenBQtyNum}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                reverseTokens={reverseTokens}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
        </section>
    );
}

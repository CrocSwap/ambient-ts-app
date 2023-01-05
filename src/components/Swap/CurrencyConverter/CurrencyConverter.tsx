import { ChangeEvent, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import {
    reverseTokensInRTK,
    setIsTokenAPrimary,
    setPrimaryQuantity,
    setShouldSwapConverterUpdate,
} from '../../../utils/state/tradeDataSlice';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { calcImpact } from '../../../App/functions/calcImpact';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { ZERO_ADDRESS } from '../../../constants';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';

interface CurrencyConverterPropsIF {
    crocEnv: CrocEnv | undefined;
    poolExists: boolean | undefined;
    isUserLoggedIn: boolean | undefined;
    provider: ethers.providers.Provider | undefined;
    slippageTolerancePercentage: number;
    setPriceImpact: Dispatch<SetStateAction<CrocImpact | undefined>>;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    chainId: string;
    isLiq: boolean;
    poolPriceDisplay: number | undefined;
    isTokenAPrimary: boolean;
    // nativeBalance: string;
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
    gasPriceInGwei: number | undefined;

    isSwapCopied?: boolean;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
}

export default function CurrencyConverter(props: CurrencyConverterPropsIF) {
    const {
        crocEnv,
        poolExists,
        isUserLoggedIn,
        provider,
        slippageTolerancePercentage,
        setPriceImpact,
        tokenPair,
        // isSellTokenBase,
        tokensBank,
        setImportedTokens,
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
        gasPriceInGwei,
        isSwapCopied,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
    } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isSellTokenEth = tradeData.tokenA.address === ZERO_ADDRESS;
    const isSellTokenBase = tradeData.baseToken.address === tradeData.tokenA.address;

    const isTokenAPrimary = tradeData.isTokenAPrimary;

    const shouldSwapConverterUpdate = tradeData.shouldSwapConverterUpdate;

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

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        return (
            locationSlug +
            '/chain=0x5&tokenA=' +
            tokenPair.dataTokenB.address +
            '&tokenB=' +
            tokenPair.dataTokenA.address
        );
    }, [pathname, tokenPair.dataTokenB.address, tokenPair.dataTokenA.address]);

    const [switchBoxes, setSwitchBoxes] = useState(false);

    const reverseTokens = (): void => {
        setSwitchBoxes(!switchBoxes);
        dispatch(reverseTokensInRTK());
        navigate(linkPath);
        if (!isTokenAPrimaryLocal) {
            console.log('setting token a');
            setTokenAQtyLocal(tokenBQtyLocal);
            setTokenAInputQty(tokenBQtyLocal);
            const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
            if (buyQtyField) {
                buyQtyField.value = '';
            }
            const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal;
            }
        } else {
            console.log('setting token a');
            setTokenBQtyLocal(tokenAQtyLocal);
            setTokenBInputQty(tokenAQtyLocal);
            const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = '';
            }
            const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
            if (buyQtyField) {
                buyQtyField.value = tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal;
            }
        }
        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        dispatch(setIsTokenAPrimary(!isTokenAPrimary));
    };

    useEffect(() => {
        isTokenAPrimary ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
    }, [
        crocEnv,
        poolExists,
        poolPriceDisplay,
        isSellTokenBase,
        isTokenAPrimary,
        tokenABalance,
        isWithdrawFromDexChecked,
        tokenPair.dataTokenA.address,
        tokenPair.dataTokenB.address,
        slippageTolerancePercentage,
        shouldSwapConverterUpdate,
    ]);

    const handleSwapButtonMessage = (tokenAAmount: number) => {
        if (!poolExists) {
            setSwapAllowed(false);
            if (poolExists === undefined) setSwapButtonErrorMessage('...');
            if (poolExists === false) setSwapButtonErrorMessage('Pool Not Initialized');
        } else if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
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
        if (!crocEnv) return;
        let rawTokenBQty;

        if (evt) {
            const tokenBInputField = document.getElementById('buy-quantity');
            if (tokenBInputField) {
                (tokenBInputField as HTMLInputElement).value = '';
            }
            const tokenAInputField = document.getElementById('sell-quantity');

            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            if (tokenAInputField) {
                (tokenAInputField as HTMLInputElement).value = input;
            }

            const parsedInput = parseFloat(input);
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                if (input !== '') return;
            }

            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));
            if (!poolPriceDisplay) return;

            if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address) return;

            const impact =
                input !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage / 100,
                          input,
                      )
                    : undefined;

            setPriceImpact(impact);
            // impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        } else {
            // console.log('token a change event triggered - no event');

            const tokenAQty = tradeData?.primaryQuantity;
            const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;

            if (sellQtyField) {
                sellQtyField.value = tokenAQty === 'NaN' ? '' : tokenAQty;
            }

            handleSwapButtonMessage(parseFloat(tokenAQty));
            // console.log(tokenPair.dataTokenA.address);

            if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address) return;
            const impact =
                tokenAQtyLocal !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage / 100,
                          tokenAQty,
                      )
                    : undefined;
            // console.log({ impact });
            setPriceImpact(impact);
            // impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';
        // const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
        dispatch(setShouldSwapConverterUpdate(false));
    };

    const handleTokenAChangeClick = async (value: string) => {
        if (!crocEnv) return;
        let rawTokenBQty;
        const tokenAInputField = document.getElementById('sell-quantity');
        if (tokenAInputField) {
            (tokenAInputField as HTMLInputElement).value = value;
        }
        if (value) {
            const input = value;
            // console.log({ input });
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));

            if (!poolPriceDisplay) return;
            const impact =
                input !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage / 100,
                          input,
                      )
                    : undefined;
            setPriceImpact(impact);
            // impact ? setPriceImpact(impact) : null;

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
                          slippageTolerancePercentage / 100,
                          tokenAQtyLocal,
                      )
                    : undefined;

            setPriceImpact(impact);
            // impact ? setPriceImpact(impact) : null;

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
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
            const tokenAInputField = document.getElementById('sell-quantity');
            if (tokenAInputField) {
                (tokenAInputField as HTMLInputElement).value = '';
            }
            const tokenBInputField = document.getElementById('buy-quantity');

            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            if (tokenBInputField) {
                (tokenBInputField as HTMLInputElement).value = input;
            }

            const parsedInput = parseFloat(input);
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                if (input !== '') return;
            }

            // if (input === '' || isNaN(parsedInput) || parsedInput === 0) return;

            // console.log({ parsedInput });

            setTokenBQtyLocal(input);
            setTokenBInputQty(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address) return;

            const impact =
                input !== ''
                    ? await calcImpact(
                          false,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage / 100,
                          input,
                      )
                    : undefined;

            setPriceImpact(impact);
            // impact ? setPriceImpact(impact) : null;

            rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;

            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
        } else {
            // console.log('token B change event triggered - no event');

            const tokenBQty = tradeData?.primaryQuantity;

            const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

            if (buyQtyField) {
                buyQtyField.value = tokenBQty === 'NaN' ? '' : tokenBQty;
            }
            handleSwapButtonMessage(parseFloat(tokenBQty));

            if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address) return;
            const impact =
                tokenBQty !== ''
                    ? await calcImpact(
                          false,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage / 100,
                          tokenBQty,
                      )
                    : undefined;

            setPriceImpact(impact);

            // impact ? setPriceImpact(impact) : null;

            rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;
            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
        }

        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 2
                ? rawTokenAQty.toPrecision(3)
                : truncateDecimals(rawTokenAQty, 2)
            : '';

        setTokenAQtyLocal(truncatedTokenAQty);
        setTokenAInputQty(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
        }
        dispatch(setShouldSwapConverterUpdate(false));
    };

    return (
        <section
            className={`${styles.currency_converter} ${
                switchBoxes ? styles.currency_converter_switch : null
            }`}
        >
            <CurrencySelector
                provider={provider}
                isUserLoggedIn={isUserLoggedIn}
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                chainId={chainId}
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                tokenAorB={'A'}
                sellToken
                userHasEnteredAmount={userHasEnteredAmount}
                handleChangeEvent={handleTokenAChangeEvent}
                handleChangeClick={handleTokenAChangeClick}
                // nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                tokenADexBalance={tokenADexBalance}
                tokenBDexBalance={tokenBDexBalance}
                isSellTokenEth={isSellTokenEth}
                tokenAQtyCoveredByWalletBalance={tokenAQtyCoveredByWalletBalance}
                tokenAQtyCoveredBySurplusBalance={tokenAQtyCoveredBySurplusBalance}
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
                gasPriceInGwei={gasPriceInGwei}
                isSwapCopied={isSwapCopied}
                importedTokensPlus={importedTokensPlus}
                verifyToken={verifyToken}
                getTokensByName={getTokensByName}
                getTokenByAddress={getTokenByAddress}
                getRecentTokens={getRecentTokens}
                addRecentToken={addRecentToken}
            />
            <div className={styles.arrow_container} onClick={reverseTokens}>
                {isLiq ? null : (
                    <IconWithTooltip title='Reverse tokens' placement='left'>
                        <TokensArrow />
                    </IconWithTooltip>
                )}
            </div>
            <CurrencySelector
                provider={provider}
                isUserLoggedIn={isUserLoggedIn}
                tokenBQtyLocal={tokenBQtyLocal}
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                chainId={chainId}
                direction={isLiq ? '' : 'To:'}
                fieldId='buy'
                tokenAorB={'B'}
                userHasEnteredAmount={userHasEnteredAmount}
                handleChangeEvent={handleTokenBChangeEvent}
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
                gasPriceInGwei={gasPriceInGwei}
                isSwapCopied={isSwapCopied}
                importedTokensPlus={importedTokensPlus}
                verifyToken={verifyToken}
                getTokensByName={getTokensByName}
                getTokenByAddress={getTokenByAddress}
                getRecentTokens={getRecentTokens}
                addRecentToken={addRecentToken}
            />
        </section>
    );
}

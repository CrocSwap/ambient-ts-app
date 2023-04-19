import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import {
    setIsTokenAPrimary,
    setPrimaryQuantity,
} from '../../../utils/state/tradeDataSlice';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import { CrocEnv, CrocImpact, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { calcImpact } from '../../../App/functions/calcImpact';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../constants';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';
import { allDexBalanceMethodsIF } from '../../../App/hooks/useExchangePrefs';
import { ackTokensMethodsIF } from '../../../App/hooks/useAckTokens';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    poolExists: boolean | undefined;
    isUserLoggedIn: boolean | undefined;
    provider: ethers.providers.Provider | undefined;
    slippageTolerancePercentage: number;
    setPriceImpact: Dispatch<SetStateAction<CrocImpact | undefined>>;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    chainId: string;
    isLiq: boolean;
    poolPriceDisplay: number | undefined;
    isTokenAPrimary: boolean;
    // nativeBalance: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    sellQtyString: string;
    buyQtyString: string;
    setSellQtyString: Dispatch<SetStateAction<string>>;
    setBuyQtyString: Dispatch<SetStateAction<string>>;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    setSwapAllowed: Dispatch<SetStateAction<boolean>>;
    setSwapButtonErrorMessage: Dispatch<SetStateAction<string>>;
    gasPriceInGwei: number | undefined;
    isSwapCopied?: boolean;
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
    priceImpact: CrocImpact | undefined;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    lastBlockNumber: number;
    dexBalancePrefs: allDexBalanceMethodsIF;
    setTokenAQtyCoveredByWalletBalance: Dispatch<SetStateAction<number>>;
    ackTokens: ackTokensMethodsIF;
}

export default function CurrencyConverter(props: propsIF) {
    const {
        crocEnv,
        poolExists,
        isUserLoggedIn,
        provider,
        slippageTolerancePercentage,
        setPriceImpact,
        tokenPair,
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
        sellQtyString,
        buyQtyString,
        setSellQtyString,
        setBuyQtyString,
        gasPriceInGwei,
        isSwapCopied,
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
        lastBlockNumber,
        dexBalancePrefs,
        setTokenAQtyCoveredByWalletBalance,
        ackTokens,
    } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const [tokenALocal, setTokenALocal] = useState<string>(
        tradeData.tokenA.address,
    );
    const [tokenBLocal, setTokenBLocal] = useState<string>(
        tradeData.tokenB.address,
    );
    const [tokenASymbolLocal, setTokenASymbolLocal] = useState<string>(
        tradeData.tokenA.symbol,
    );
    const [tokenBSymbolLocal, setTokenBSymbolLocal] = useState<string>(
        tradeData.tokenB.symbol,
    );

    const isSellTokenEth = tradeData.tokenA.address === ZERO_ADDRESS;

    useEffect(() => {
        setTokenALocal(tradeData.tokenA.address);
        setTokenASymbolLocal(tradeData.tokenA.symbol);
    }, [
        tradeData.tokenA.address,
        tradeData.tokenA.symbol,
        tradeData.tokenA.chainId,
    ]);

    useEffect(() => {
        setTokenBLocal(tradeData.tokenB.address);
        setTokenBSymbolLocal(tradeData.tokenB.symbol);
    }, [
        tradeData.tokenB.address,
        tradeData.tokenB.symbol,
        tradeData.tokenB.chainId,
    ]);

    const sortedTokens = sortBaseQuoteTokens(tokenALocal, tokenBLocal);
    const isSellTokenBase = tokenALocal === sortedTokens[0];

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        tradeData.isTokenAPrimary ? tradeData?.primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !tradeData.isTokenAPrimary ? tradeData?.primaryQuantity : '',
    );

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenBBalance = isSellTokenBase
        ? quoteTokenBalance
        : baseTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;
    const tokenBDexBalance = isSellTokenBase
        ? quoteTokenDexBalance
        : baseTokenDexBalance;

    const combinedTokenABalance = tokenABalance + tokenADexBalance;

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAQtyLocal || '0');

    const tokenASurplusMinusTokenAQtyNum =
        tokenASurplusMinusTokenARemainderNum >= 0
            ? tokenASurplusMinusTokenARemainderNum
            : 0;

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

    const [
        userOverrodeSurplusWithdrawalDefault,
        setUserOverrodeSurplusWithdrawalDefault,
    ] = useState<boolean>(false);

    useEffect(() => {
        if (
            !isWithdrawFromDexChecked &&
            !userOverrodeSurplusWithdrawalDefault &&
            !!tokenADexBalance &&
            parseFloat(tokenADexBalance) > 0
        ) {
            setIsWithdrawFromDexChecked(true);
        }
    }, [
        isWithdrawFromDexChecked,
        userOverrodeSurplusWithdrawalDefault,
        tokenADexBalance,
    ]);

    useEffect(() => {
        setTokenAQtyCoveredByWalletBalance(tokenAQtyCoveredByWalletBalance);
    }, [tokenAQtyCoveredByWalletBalance]);

    const tokenAWalletMinusTokenAQtyNum =
        isWithdrawFromDexChecked && tokenASurplusMinusTokenARemainderNum < 0
            ? parseFloat(tokenABalance || '0') +
              tokenASurplusMinusTokenARemainderNum
            : isWithdrawFromDexChecked
            ? parseFloat(tokenABalance || '0')
            : parseFloat(tokenABalance || '0') -
              parseFloat(tokenAQtyLocal || '0');

    const tokenBWalletPlusTokenBQtyNum =
        parseFloat(tokenBBalance || '0') + parseFloat(tokenBQtyLocal || '0');
    const tokenBSurplusPlusTokenBQtyNum =
        parseFloat(tokenBDexBalance || '0') + parseFloat(tokenBQtyLocal || '0');

    const linkPathReversed = useMemo(() => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market')) {
            locationSlug = '/trade/market/';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit/';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range/';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap/';
        }
        return (
            locationSlug +
            formSlugForPairParams(
                tokenPair.dataTokenA.chainId,
                tokenPair.dataTokenB,
                tokenPair.dataTokenA,
            )
        );
    }, [pathname, tokenPair.dataTokenB.address, tokenPair.dataTokenA.address]);

    const [switchBoxes, setSwitchBoxes] = useState(false);

    const [disableReverseTokens, setDisableReverseTokens] = useState(false);

    useEffect(() => {
        // re-enable every 3 seconds
        const timerId = setInterval(() => {
            setDisableReverseTokens(false);
        }, 3000);

        // clear interval when component unmounts
        return () => clearInterval(timerId);
    }, []);

    const reverseTokens = (): void => {
        if (disableReverseTokens || !poolExists) {
            return;
        } else {
            setDisableReverseTokens(true);
            setSwitchBoxes(!switchBoxes);

            setTokenALocal(tokenBLocal);
            setTokenBLocal(tokenALocal);
            setTokenASymbolLocal(tokenBSymbolLocal);
            setTokenBSymbolLocal(tokenASymbolLocal);

            navigate(linkPathReversed);
            if (!isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tokenBQtyLocal);

                setBuyQtyString('');

                setSellQtyString(
                    tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal,
                );
                setTokenBQtyLocal('');
            } else {
                setTokenBQtyLocal(tokenAQtyLocal);
                setSellQtyString('');

                setBuyQtyString(tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal);
                setTokenAQtyLocal('');
            }
            dispatch(setIsTokenAPrimary(!isTokenAPrimaryLocal));
            setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        }
    };

    const handleBlockUpdate = () => {
        if (
            !disableReverseTokens &&
            tokenAQtyLocal !== '' &&
            tokenBQtyLocal !== ''
        ) {
            setDisableReverseTokens(true);

            isTokenAPrimaryLocal
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    };

    useEffect(() => {
        handleSwapButtonMessage(parseFloat(tokenAQtyLocal));
    }, [tokenAQtyLocal, buyQtyString]);

    useEffect(() => {
        handleBlockUpdate();
    }, [lastBlockNumber]);

    useEffect(() => {
        isTokenAPrimaryLocal
            ? handleTokenAChangeEvent()
            : handleTokenBChangeEvent();
    }, [
        crocEnv,
        poolExists,
        tokenALocal + tokenBLocal,
        isTokenAPrimaryLocal,
        combinedTokenABalance,
        isWithdrawFromDexChecked,
        slippageTolerancePercentage,
    ]);

    useEffect(() => {
        if (!poolExists) {
            setSwapAllowed(false);

            if (poolExists === undefined) {
                setSwapButtonErrorMessage('...');
            } else if (poolExists === false) {
                setSwapButtonErrorMessage('Pool Not Initialized');
            }
        }
    }, [poolExists === undefined, poolExists === false]);

    const handleSwapButtonMessage = (tokenAAmount: number) => {
        if (!poolExists) {
            setSwapAllowed(false);

            if (poolExists === undefined) {
                setSwapButtonErrorMessage('...');
            } else if (poolExists === false) {
                setSwapButtonErrorMessage('Pool Not Initialized');
            }
        } else if (isNaN(tokenAAmount)) {
            return;
        } else if (tokenAAmount <= 0) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else if (buyQtyString === '' || sellQtyString === '') {
            setSwapButtonErrorMessage('...');
        } else {
            if (isWithdrawFromDexChecked) {
                if (
                    tokenAAmount >
                    parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                ) {
                    setSwapAllowed(false);
                    setSwapButtonErrorMessage(
                        `${tokenASymbolLocal} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setSwapAllowed(true);
                }
            } else {
                if (tokenAAmount > parseFloat(tokenABalance)) {
                    setSwapAllowed(false);
                    setSwapButtonErrorMessage(
                        `${tokenASymbolLocal} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setSwapAllowed(true);
                }
            }
        }
    };

    const handleTokenAChangeEvent = async (
        evt?: ChangeEvent<HTMLInputElement>,
    ) => {
        if (!crocEnv) {
            return;
        }
        let rawTokenBQty;
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');

            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;

            const parsedInput = parseFloat(input);

            setTokenAQtyLocal(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));
            if (!poolPriceDisplay) return;

            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                setPriceImpact(undefined);

                if (isNaN(parsedInput) || parsedInput === 0) return;
            }
            try {
                const impact =
                    input !== ''
                        ? await calcImpact(
                              true,
                              crocEnv,
                              tokenALocal,
                              tokenBLocal,
                              slippageTolerancePercentage / 100,
                              input,
                          )
                        : undefined;

                setPriceImpact(impact);

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.error({ error });
                setSwapAllowed(false);
            }
        } else {
            IS_LOCAL_ENV &&
                console.debug(
                    'token a change event triggered - no keyboard event',
                );
            if (!poolExists) {
                setSwapAllowed(false);

                if (poolExists === undefined) {
                    setSwapButtonErrorMessage('...');
                } else if (poolExists === false) {
                    setSwapButtonErrorMessage('Pool Not Initialized');
                }
                return;
            }
            if (!(parseFloat(tokenAQtyLocal) > 0)) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                setTokenBQtyLocal('');

                return;
            }
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));

            try {
                const impact =
                    tokenAQtyLocal !== ''
                        ? await calcImpact(
                              true,
                              crocEnv,
                              tokenALocal,
                              tokenBLocal,
                              slippageTolerancePercentage / 100,
                              tokenAQtyLocal,
                          )
                        : undefined;
                setPriceImpact(impact);

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.error({ error });
            }
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        setTokenBQtyLocal(truncatedTokenBQty);
        setBuyQtyString(truncatedTokenBQty);
    };

    const handleTokenAChangeClick = async (value: string) => {
        if (!crocEnv) {
            return;
        }
        let rawTokenBQty;
        const tokenAInputField = document.getElementById('sell-quantity');
        if (tokenAInputField) {
            (tokenAInputField as HTMLInputElement).value = value;
        }
        if (value) {
            const input = value.replaceAll(',', '');
            setSellQtyString(input);
            setTokenAQtyLocal(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));

            if (!poolPriceDisplay) return;

            try {
                const impact =
                    input !== ''
                        ? await calcImpact(
                              true,
                              crocEnv,
                              tokenALocal,
                              tokenBLocal,
                              slippageTolerancePercentage / 100,
                              input,
                          )
                        : undefined;
                setPriceImpact(impact);

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.error({ error });
            }
        } else {
            if (tokenAQtyLocal === '' && tokenBQtyLocal === '') {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                return;
            }
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));
            try {
                const impact =
                    tokenAQtyLocal !== ''
                        ? await calcImpact(
                              true,
                              crocEnv,
                              tokenALocal,
                              tokenBLocal,
                              slippageTolerancePercentage / 100,
                              tokenAQtyLocal,
                          )
                        : undefined;

                setPriceImpact(impact);

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.error({ error });
            }
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        if (truncatedTokenBQty !== tokenBQtyLocal)
            setTokenBQtyLocal(truncatedTokenBQty);
        if (truncatedTokenBQty !== buyQtyString)
            setBuyQtyString(truncatedTokenBQty);
    };

    const handleTokenBChangeEvent = async (
        evt?: ChangeEvent<HTMLInputElement>,
    ) => {
        if (!crocEnv) {
            return;
        }

        let rawTokenAQty: number | undefined;
        if (evt) {
            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value.replaceAll(',', '')
                : evt.target.value.replaceAll(',', '');

            setTokenBQtyLocal(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address)
                return;

            const parsedInput = parseFloat(input);

            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                setPriceImpact(undefined);
                if (isNaN(parsedInput) || parsedInput === 0) return;
            }
            try {
                const impact =
                    input !== ''
                        ? await calcImpact(
                              false,
                              crocEnv,
                              tokenALocal,
                              tokenBLocal,
                              slippageTolerancePercentage / 100,
                              input,
                          )
                        : undefined;

                setPriceImpact(impact);

                rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;
            } catch (error) {
                console.error({ error });
                setSwapAllowed(false);
            }
            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
        } else {
            IS_LOCAL_ENV &&
                console.debug(
                    'token B change event triggered - no keyboard event',
                );
            if (!poolExists) {
                setSwapAllowed(false);

                if (poolExists === undefined) {
                    setSwapButtonErrorMessage('...');
                } else if (poolExists === false) {
                    setSwapButtonErrorMessage('Pool Not Initialized');
                }
                return;
            }
            if (!(parseFloat(tokenBQtyLocal) > 0)) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                setTokenAQtyLocal('');

                return;
            }

            try {
                const impact =
                    tokenBQtyLocal !== ''
                        ? await calcImpact(
                              false,
                              crocEnv,
                              tokenALocal,
                              tokenBLocal,
                              slippageTolerancePercentage / 100,
                              tokenBQtyLocal,
                          )
                        : undefined;

                setPriceImpact(impact);

                rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;
            } catch (error) {
                console.error({ error });
            }

            handleSwapButtonMessage(rawTokenAQty ?? 0);
        }

        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 2
                ? rawTokenAQty.toPrecision(3)
                : truncateDecimals(rawTokenAQty, 2)
            : '';

        if (truncatedTokenAQty !== tokenAQtyLocal)
            setTokenAQtyLocal(truncatedTokenAQty);

        if (truncatedTokenAQty !== sellQtyString)
            setSellQtyString(truncatedTokenAQty);
    };

    return (
        <section
            className={`${styles.currency_converter} ${
                switchBoxes ? styles.currency_converter_switch : null
            }`}
        >
            <CurrencySelector
                provider={provider}
                sellQtyString={sellQtyString}
                setSellQtyString={setSellQtyString}
                buyQtyString={buyQtyString}
                setBuyQtyString={setBuyQtyString}
                isUserLoggedIn={isUserLoggedIn}
                tokenPair={tokenPair}
                chainId={chainId}
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                tokenAorB={'A'}
                sellToken
                handleChangeEvent={handleTokenAChangeEvent}
                handleChangeClick={handleTokenAChangeClick}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                tokenADexBalance={tokenADexBalance}
                tokenBDexBalance={tokenBDexBalance}
                isSellTokenEth={isSellTokenEth}
                tokenAQtyCoveredByWalletBalance={
                    tokenAQtyCoveredByWalletBalance
                }
                tokenAQtyCoveredBySurplusBalance={
                    tokenAQtyCoveredBySurplusBalance
                }
                tokenASurplusMinusTokenARemainderNum={
                    tokenASurplusMinusTokenARemainderNum
                }
                tokenAWalletMinusTokenAQtyNum={tokenAWalletMinusTokenAQtyNum}
                tokenBWalletPlusTokenBQtyNum={tokenBWalletPlusTokenBQtyNum}
                tokenASurplusMinusTokenAQtyNum={tokenASurplusMinusTokenAQtyNum}
                tokenBSurplusPlusTokenBQtyNum={tokenBSurplusPlusTokenBQtyNum}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                reverseTokens={reverseTokens}
                gasPriceInGwei={gasPriceInGwei}
                isSwapCopied={isSwapCopied}
                importedTokensPlus={importedTokensPlus}
                verifyToken={verifyToken}
                getTokensByName={getTokensByName}
                getTokenByAddress={getTokenByAddress}
                getRecentTokens={getRecentTokens}
                addRecentToken={addRecentToken}
                outputTokens={outputTokens}
                validatedInput={validatedInput}
                setInput={setInput}
                searchType={searchType}
                openGlobalPopup={openGlobalPopup}
                setDisableReverseTokens={setDisableReverseTokens}
                dexBalancePrefs={dexBalancePrefs}
                ackTokens={ackTokens}
                setUserOverrodeSurplusWithdrawalDefault={
                    setUserOverrodeSurplusWithdrawalDefault
                }
            />
            <div
                className={
                    disableReverseTokens
                        ? styles.arrow_container_disabled
                        : styles.arrow_container
                }
                onClick={reverseTokens}
            >
                {isLiq ? null : <TokensArrow disabled={disableReverseTokens} />}
            </div>
            <div id='swap_currency_converter'>
                <CurrencySelector
                    provider={provider}
                    sellQtyString={sellQtyString}
                    setSellQtyString={setSellQtyString}
                    setBuyQtyString={setBuyQtyString}
                    buyQtyString={buyQtyString}
                    isUserLoggedIn={isUserLoggedIn}
                    tokenBQtyLocal={tokenBQtyLocal}
                    tokenPair={tokenPair}
                    chainId={chainId}
                    direction={isLiq ? '' : 'To:'}
                    fieldId='buy'
                    tokenAorB={'B'}
                    handleChangeEvent={handleTokenBChangeEvent}
                    tokenABalance={tokenABalance}
                    tokenBBalance={tokenBBalance}
                    tokenADexBalance={tokenADexBalance}
                    tokenBDexBalance={tokenBDexBalance}
                    tokenAWalletMinusTokenAQtyNum={
                        tokenAWalletMinusTokenAQtyNum
                    }
                    tokenBWalletPlusTokenBQtyNum={tokenBWalletPlusTokenBQtyNum}
                    tokenASurplusMinusTokenAQtyNum={
                        tokenASurplusMinusTokenAQtyNum
                    }
                    tokenBSurplusPlusTokenBQtyNum={
                        tokenBSurplusPlusTokenBQtyNum
                    }
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    reverseTokens={reverseTokens}
                    setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                    gasPriceInGwei={gasPriceInGwei}
                    isSwapCopied={isSwapCopied}
                    importedTokensPlus={importedTokensPlus}
                    verifyToken={verifyToken}
                    getTokensByName={getTokensByName}
                    getTokenByAddress={getTokenByAddress}
                    getRecentTokens={getRecentTokens}
                    addRecentToken={addRecentToken}
                    outputTokens={outputTokens}
                    validatedInput={validatedInput}
                    setInput={setInput}
                    searchType={searchType}
                    openGlobalPopup={openGlobalPopup}
                    setDisableReverseTokens={setDisableReverseTokens}
                    dexBalancePrefs={dexBalancePrefs}
                    ackTokens={ackTokens}
                    setUserOverrodeSurplusWithdrawalDefault={
                        setUserOverrodeSurplusWithdrawalDefault
                    }
                />
            </div>
        </section>
    );
}

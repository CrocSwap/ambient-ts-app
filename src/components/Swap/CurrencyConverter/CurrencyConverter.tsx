import {
    ChangeEvent,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    // useRef,
    useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import {
    // reverseTokensInRTK,
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

interface propsIF {
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
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    acknowledgeToken: (tkn: TokenIF) => void;
    priceImpact: CrocImpact | undefined;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    lastBlockNumber: number;
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
        sellQtyString,
        buyQtyString,
        setSellQtyString,
        setBuyQtyString,
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
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        acknowledgeToken,
        openGlobalPopup,
        lastBlockNumber,
        // priceImpact,
    } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const [tokenALocal, setTokenALocal] = useState<string>(tradeData.tokenA.address);
    const [tokenBLocal, setTokenBLocal] = useState<string>(tradeData.tokenB.address);

    useEffect(() => {
        setTokenALocal(tradeData.tokenA.address);
    }, [tradeData.tokenA.address]);

    useEffect(() => {
        setTokenBLocal(tradeData.tokenB.address);
    }, [tradeData.tokenB.address]);

    const isSellTokenEth = tradeData.tokenA.address === ZERO_ADDRESS;
    const isSellTokenBase = tradeData.baseToken.address === tradeData.tokenA.address;

    const shouldSwapConverterUpdate = tradeData.shouldSwapConverterUpdate;

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        tradeData.isTokenAPrimary ? tradeData?.primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !tradeData.isTokenAPrimary ? tradeData?.primaryQuantity : '',
    );

    const userHasEnteredAmount = tokenAQtyLocal !== '';

    const tokenABalance = isSellTokenBase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isSellTokenBase ? quoteTokenBalance : baseTokenBalance;
    const tokenADexBalance = isSellTokenBase ? baseTokenDexBalance : quoteTokenDexBalance;
    const tokenBDexBalance = isSellTokenBase ? quoteTokenDexBalance : baseTokenDexBalance;

    const combinedTokenABalance = tokenABalance + tokenADexBalance;

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

    const setDefaultTokenQuantities = () => {
        if (isTokenAPrimaryLocal) {
            setTokenAQtyLocal(tradeData.primaryQuantity);
            setSellQtyString(tradeData.primaryQuantity);
        } else {
            setTokenBQtyLocal(tradeData.primaryQuantity);
            setBuyQtyString(tradeData.primaryQuantity);
        }
    };

    const [shouldUpdate, setShouldUpdate] = useState(false);

    useEffect(() => {
        console.log('new crocEnv');
        if (crocEnv) {
            setDefaultTokenQuantities();
            setShouldUpdate(true);
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

    const [disableReverseTokens, setDisableReverseTokens] = useState(false);

    const reverseTokens = (): void => {
        if (disableReverseTokens || !poolExists) {
            return;
        } else {
            setDisableReverseTokens(true);
            setSwitchBoxes(!switchBoxes);
            setTokenALocal(tokenBLocal);
            setTokenBLocal(tokenALocal);
            // dispatch(reverseTokensInRTK());
            navigate(linkPath);
            if (!isTokenAPrimaryLocal) {
                // console.log({ tokenBQtyLocal });
                setTokenAQtyLocal(tokenBQtyLocal);

                // if (tokenBQtyLocal !== '') {
                setBuyQtyString('');
                // }

                setSellQtyString(tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal);
                setTokenBQtyLocal('');
            } else {
                // console.log({ tokenAQtyLocal });
                // console.log('setting token b');
                setTokenBQtyLocal(tokenAQtyLocal);
                // if (tokenAQtyLocal !== '') {
                setSellQtyString('');
                // }

                setBuyQtyString(tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal);
                setTokenAQtyLocal('');
            }
            setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
            dispatch(setIsTokenAPrimary(!isTokenAPrimaryLocal));
        }
    };

    useEffect(() => {
        // if (crocEnv && poolExists) {
        // console.log(priceImpact?.percentChange);
        // console.log({ combinedTokenABalance });
        isTokenAPrimaryLocal ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
        if (shouldUpdate) setShouldUpdate(false);

        // }
    }, [
        shouldUpdate,
        crocEnv,
        lastBlockNumber,
        poolExists,
        tokenALocal + tokenBLocal,
        isTokenAPrimaryLocal,
        combinedTokenABalance,
        isWithdrawFromDexChecked,
        slippageTolerancePercentage,
        shouldSwapConverterUpdate,
    ]);

    useEffect(() => {
        if (!poolExists) {
            console.log({ poolExists });
            setSwapAllowed(false);

            if (poolExists === undefined) {
                setSwapButtonErrorMessage('...');
            } else if (poolExists === false) {
                setSwapButtonErrorMessage('Pool Not Initialized');
            }
        } else {
            setShouldUpdate(true);
        }
    }, [poolExists]);

    const handleSwapButtonMessage = (tokenAAmount: number) => {
        // if (tokenAQtyLocal === tokenBQtyLocal) return;
        // console.log({ tokenAAmount });
        if (!poolExists) {
            // console.log({ poolExists });
            setSwapAllowed(false);

            if (poolExists === undefined) {
                setSwapButtonErrorMessage('...');
            } else if (poolExists === false) {
                setSwapButtonErrorMessage('Pool Not Initialized');
            }
        } else if (isNaN(tokenAAmount)) {
            return;
        } else if (tokenAAmount <= 0 && !tokenBQtyLocal && !tokenAQtyLocal) {
            // console.log({ tokenAAmount });
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else {
            if (isSellTokenEth) {
                if (isWithdrawFromDexChecked) {
                    const roundedTokenADexBalance =
                        Math.floor(parseFloat(tokenADexBalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenADexBalance) {
                        // console.log({ tokenAAmount });
                        setSwapAllowed(false);
                        setSwapButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Must Be Less Than Exchange Surplus Balance`,
                        );
                    } else {
                        setSwapAllowed(true);
                    }
                } else {
                    // console.log({ tokenABalance });
                    const roundedTokenAWalletBalance =
                        Math.floor(parseFloat(tokenABalance) * 1000) / 1000;
                    if (tokenAAmount >= roundedTokenAWalletBalance) {
                        // console.log({ tokenAAmount });
                        // console.log({ roundedTokenAWalletBalance });
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
                        // console.log({ tokenAAmount });
                        setSwapAllowed(false);
                        setSwapButtonErrorMessage(
                            `${tokenPair.dataTokenA.symbol} Amount Exceeds Combined Wallet and Exchange Surplus Balance`,
                        );
                    } else {
                        setSwapAllowed(true);
                    }
                } else {
                    if (tokenAAmount > parseFloat(tokenABalance)) {
                        // console.log({ tokenAAmount });
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

    // console.log({ disableReverseTokens });

    const handleTokenAChangeEvent = async (evt?: ChangeEvent<HTMLInputElement>) => {
        if (!crocEnv) return;
        let rawTokenBQty;
        if (evt) {
            const targetValue = evt.target.value;

            const input = targetValue.startsWith('.') ? '0' + targetValue : targetValue;

            const parsedInput = parseFloat(input);

            setTokenAQtyLocal(input);
            setSellQtyString(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            // console.log({ input });
            handleSwapButtonMessage(parseFloat(input));
            if (!poolPriceDisplay) return;

            // if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address) return;
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                // console.log({ input });
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
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

                // console.log({ impact });
                setPriceImpact(impact);

                // impact ? setPriceImpact(impact) : null;

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.log({ error });
            }
        } else {
            console.log('token a change event triggered - no event');
            // console.log({ tokenAQtyLocal });
            if (!poolExists) {
                // console.log({ poolExists });
                setSwapAllowed(false);

                if (poolExists === undefined) {
                    setSwapButtonErrorMessage('...');
                } else if (poolExists === false) {
                    setSwapButtonErrorMessage('Pool Not Initialized');
                }
                return;
            }
            if (tokenAQtyLocal === '') {
                // console.log({ tokenAQtyLocal });
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                setTokenBQtyLocal('');
                setBuyQtyString('');
                setDisableReverseTokens(false);

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
                // console.log({ impact });
                setPriceImpact(impact);

                // impact ? setPriceImpact(impact) : null;

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.log({ error });
            }
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        // console.log({ truncatedTokenBQty });
        setTokenBQtyLocal(truncatedTokenBQty);
        setBuyQtyString(truncatedTokenBQty);

        setDisableReverseTokens(false);
        // if (shouldSwapConverterUpdate) dispatch(setShouldSwapConverterUpdate(false));
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
            setSellQtyString(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            // console.log({ input });
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
                if (disableReverseTokens) {
                    setDisableReverseTokens(false);
                }
                // impact ? setPriceImpact(impact) : null;

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.log({ error });
            }
        } else {
            // if (!disableReverseTokens) {
            if (tokenAQtyLocal === '' && tokenBQtyLocal === '') {
                // console.log({ tokenAQtyLocal });
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                return;
            }
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));
            // }
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
                if (disableReverseTokens) {
                    setDisableReverseTokens(false);
                }
                // impact ? setPriceImpact(impact) : null;

                rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;
            } catch (error) {
                console.log({ error });
            }
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        if (truncatedTokenBQty !== tokenBQtyLocal) setTokenBQtyLocal(truncatedTokenBQty);
        if (truncatedTokenBQty !== buyQtyString) setBuyQtyString(truncatedTokenBQty);

        // if (shouldSwapConverterUpdate) dispatch(setShouldSwapConverterUpdate(false));
    };

    // const timerRef = useRef<NodeJS.Timeout>();
    // useEffect(() => {
    //     // Clear the interval when the component unmounts
    //     return () => clearTimeout(timerRef.current);
    // }, []);

    const handleTokenBChangeEvent = async (evt?: ChangeEvent<HTMLInputElement>) => {
        if (!crocEnv) return;

        let rawTokenAQty: number | undefined;
        if (evt) {
            // const tokenAInputField = document.getElementById('sell-quantity');
            // if (tokenAInputField) {
            //     (tokenAInputField as HTMLInputElement).value = '';
            // }
            // const tokenBInputField = document.getElementById('buy-quantity');

            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            // if (tokenBInputField) {
            //     (tokenBInputField as HTMLInputElement).value = input;
            // }

            setTokenBQtyLocal(input);
            setBuyQtyString(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            if (tokenPair.dataTokenA.address === tokenPair.dataTokenB.address) return;

            const parsedInput = parseFloat(input);
            // console.log({ parsedInput });
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
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

                // impact ? setPriceImpact(impact) : null;

                rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;
            } catch (error) {
                console.log({ error });
            }
            // console.log({ rawTokenAQty });
            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
        } else {
            console.log('token B change event triggered - no event');
            if (!poolExists) {
                // console.log({ poolExists });
                setSwapAllowed(false);

                if (poolExists === undefined) {
                    setSwapButtonErrorMessage('...');
                } else if (poolExists === false) {
                    setSwapButtonErrorMessage('Pool Not Initialized');
                }
                return;
            }
            if (tokenBQtyLocal === '' && tokenAQtyLocal === '') {
                // console.log({ tokenAQtyLocal });
                setSwapAllowed(false);
                setSwapButtonErrorMessage('Enter an Amount');
                setTokenAQtyLocal('');
                setSellQtyString('');
                setDisableReverseTokens(false);

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
                console.log({ error });
            }

            // timerRef.current = setTimeout(() => handleSwapButtonMessage(rawTokenAQty ?? 0), 2500);
            handleSwapButtonMessage(rawTokenAQty ?? 0);
        }

        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 2
                ? rawTokenAQty.toPrecision(3)
                : truncateDecimals(rawTokenAQty, 2)
            : '';

        if (truncatedTokenAQty !== tokenAQtyLocal) setTokenAQtyLocal(truncatedTokenAQty);
        if (truncatedTokenAQty !== sellQtyString) setSellQtyString(truncatedTokenAQty);

        if (disableReverseTokens) setDisableReverseTokens(false);
        if (shouldSwapConverterUpdate) dispatch(setShouldSwapConverterUpdate(false));
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
                outputTokens={outputTokens}
                validatedInput={validatedInput}
                setInput={setInput}
                searchType={searchType}
                acknowledgeToken={acknowledgeToken}
                openGlobalPopup={openGlobalPopup}
                setDisableReverseTokens={setDisableReverseTokens}
            />
            <div
                className={
                    disableReverseTokens ? styles.arrow_container_disabled : styles.arrow_container
                }
                onClick={reverseTokens}
            >
                {isLiq ? null : (
                    <IconWithTooltip title='Reverse tokens' placement='left' enterDelay='1000'>
                        <TokensArrow />
                    </IconWithTooltip>
                )}
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
                    outputTokens={outputTokens}
                    validatedInput={validatedInput}
                    setInput={setInput}
                    searchType={searchType}
                    acknowledgeToken={acknowledgeToken}
                    openGlobalPopup={openGlobalPopup}
                    setDisableReverseTokens={setDisableReverseTokens}
                />
            </div>
        </section>
    );
}

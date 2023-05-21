import {
    ChangeEvent,
    Dispatch,
    memo,
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
import { ZERO_ADDRESS } from '../../../constants';
import { getRecentTokensParamsIF } from '../../../App/hooks/useRecentTokens';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { useAccount } from 'wagmi';
import { tokenMethodsIF } from '../../../App/hooks/useTokens';
import { shallowEqual } from 'react-redux';

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
    lastBlockNumber: number;
    setTokenAQtyCoveredByWalletBalance: Dispatch<SetStateAction<number>>;
    tokens: tokenMethodsIF;
    isLiquidityInsufficient: boolean;
    setIsLiquidityInsufficient: Dispatch<SetStateAction<boolean>>;
}

function CurrencyConverter(props: propsIF) {
    const dispatch = useAppDispatch();

    const {
        tokenAAddress,
        tokenBAddress,
        tokenASymbol,
        tokenBSymbol,
        isTokenAPrimary,
        primaryQuantity,
    } = useAppSelector(
        (state) => ({
            tokenAAddress: state.tradeData.tokenA.address,
            tokenBAddress: state.tradeData.tokenB.address,
            tokenASymbol: state.tradeData.tokenA.symbol,
            tokenBSymbol: state.tradeData.tokenB.symbol,
            isTokenAPrimary: state.tradeData.isTokenAPrimary,
            primaryQuantity: state.tradeData.primaryQuantity,
        }),
        shallowEqual,
    );

    const [tokenALocal, setTokenALocal] = useState<string>(tokenAAddress);
    const [tokenBLocal, setTokenBLocal] = useState<string>(tokenBAddress);
    const [tokenASymbolLocal, setTokenASymbolLocal] =
        useState<string>(tokenASymbol);
    const [tokenBSymbolLocal, setTokenBSymbolLocal] =
        useState<string>(tokenBSymbol);

    const [isSellLoading, setIsSellLoading] = useState(false);
    const [isBuyLoading, setIsBuyLoading] = useState(false);

    const isSellTokenEth = tokenAAddress === ZERO_ADDRESS;

    useEffect(() => {
        setTokenALocal(tokenAAddress);
        setTokenASymbolLocal(tokenASymbol);
    }, [tokenAAddress, tokenASymbol, props.chainId]);

    useEffect(() => {
        setTokenBLocal(tokenBAddress);
        setTokenBSymbolLocal(tokenBSymbol);
    }, [tokenBAddress, tokenBSymbol, props.chainId]);

    const sortedTokens = sortBaseQuoteTokens(tokenALocal, tokenBLocal);
    const isSellTokenBase = tokenALocal === sortedTokens[0];

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] =
        useState<boolean>(isTokenAPrimary);

    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        isTokenAPrimary ? primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !isTokenAPrimary ? primaryQuantity : '',
    );

    useEffect(() => {
        if (isTokenAPrimaryLocal) {
            if (tokenAQtyLocal !== '') {
                setIsBuyLoading(true);
            }
        } else {
            if (tokenBQtyLocal !== '') {
                setIsSellLoading(true);
            }
        }
    }, []);

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const tokenABalance = isSellTokenBase
        ? props.baseTokenBalance
        : props.quoteTokenBalance;
    const tokenBBalance = isSellTokenBase
        ? props.quoteTokenBalance
        : props.baseTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? props.baseTokenDexBalance
        : props.quoteTokenDexBalance;
    const tokenBDexBalance = isSellTokenBase
        ? props.quoteTokenDexBalance
        : props.baseTokenDexBalance;

    const combinedTokenABalance = tokenABalance + tokenADexBalance;
    const combinedTokenBBalance = tokenBBalance + tokenBDexBalance;

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAQtyLocal || '0');

    const tokenASurplusMinusTokenAQtyNum =
        tokenASurplusMinusTokenARemainderNum >= 0
            ? tokenASurplusMinusTokenARemainderNum
            : 0;

    const tokenAQtyCoveredBySurplusBalance = props.isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum >= 0
            ? parseFloat(tokenAQtyLocal || '0')
            : parseFloat(tokenADexBalance || '0')
        : 0;

    const tokenAQtyCoveredByWalletBalance = props.isWithdrawFromDexChecked
        ? tokenASurplusMinusTokenARemainderNum < 0
            ? tokenASurplusMinusTokenARemainderNum * -1
            : 0
        : parseFloat(tokenAQtyLocal || '0');

    const [
        userOverrodeSurplusWithdrawalDefault,
        setUserOverrodeSurplusWithdrawalDefault,
    ] = useState<boolean>(false);

    const [userClickedCombinedMax, setUserClickedCombinedMax] =
        useState<boolean>(false);

    useEffect(() => {
        if (
            !props.isWithdrawFromDexChecked &&
            !userOverrodeSurplusWithdrawalDefault &&
            !!tokenADexBalance &&
            parseFloat(tokenADexBalance) > 0
        ) {
            props.setIsWithdrawFromDexChecked(true);
        }
    }, [
        props.isWithdrawFromDexChecked,
        userOverrodeSurplusWithdrawalDefault,
        tokenADexBalance,
    ]);

    useEffect(() => {
        props.setTokenAQtyCoveredByWalletBalance(
            tokenAQtyCoveredByWalletBalance,
        );
    }, [tokenAQtyCoveredByWalletBalance]);

    const tokenAWalletMinusTokenAQtyNum =
        props.isWithdrawFromDexChecked &&
        tokenASurplusMinusTokenARemainderNum < 0
            ? parseFloat(tokenABalance || '0') +
              tokenASurplusMinusTokenARemainderNum
            : props.isWithdrawFromDexChecked
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
                props.tokenPair.dataTokenA.chainId,
                props.tokenPair.dataTokenB.address,
                props.tokenPair.dataTokenA.address,
            )
        );
    }, [
        pathname,
        props.tokenPair.dataTokenB.address,
        props.tokenPair.dataTokenA.address,
    ]);

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

    const reverseTokens = useMemo(
        () => (): void => {
            if (disableReverseTokens || !props.poolExists) {
                return;
            } else {
                setDisableReverseTokens(true);
                setUserClickedCombinedMax(false);
                setSwitchBoxes(!switchBoxes);

                isTokenAPrimaryLocal
                    ? tokenAQtyLocal !== '' && parseFloat(tokenAQtyLocal) > 0
                        ? setIsSellLoading(true)
                        : null
                    : tokenBQtyLocal !== '' && parseFloat(tokenBQtyLocal) > 0
                    ? setIsBuyLoading(true)
                    : null;

                setTokenALocal(tokenBLocal);
                setTokenBLocal(tokenALocal);
                setTokenASymbolLocal(tokenBSymbolLocal);
                setTokenBSymbolLocal(tokenASymbolLocal);

                navigate(linkPathReversed);
                if (!isTokenAPrimaryLocal) {
                    setTokenAQtyLocal(tokenBQtyLocal);
                    props.setBuyQtyString('');

                    props.setSellQtyString(
                        tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal,
                    );
                    setTokenBQtyLocal('');
                } else {
                    setTokenBQtyLocal(tokenAQtyLocal);
                    props.setSellQtyString('');
                    props.setBuyQtyString(
                        tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal,
                    );
                    setTokenAQtyLocal('');
                }
                dispatch(setIsTokenAPrimary(!isTokenAPrimaryLocal));
                setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
            }
        },
        [
            props.crocEnv,
            props.poolPriceDisplay,
            tokenALocal,
            tokenBLocal,
            props.slippageTolerancePercentage,
            isTokenAPrimaryLocal,
            linkPathReversed,
            disableReverseTokens,
        ],
    );

    const handleBlockUpdate = () => {
        if (!disableReverseTokens) {
            setDisableReverseTokens(true);

            isTokenAPrimaryLocal
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    };

    useEffect(() => {
        handleSwapButtonMessage(parseFloat(tokenAQtyLocal));
    }, [tokenAQtyLocal, props.buyQtyString, props.isWithdrawFromDexChecked]);

    useEffect(() => {
        handleBlockUpdate();
    }, [props.lastBlockNumber]);

    useEffect(() => {
        isTokenAPrimaryLocal
            ? handleTokenAChangeEvent()
            : handleTokenBChangeEvent();
    }, [
        props.crocEnv,
        props.poolExists,
        tokenALocal + tokenBLocal,
        isTokenAPrimaryLocal,
        combinedTokenABalance,
        combinedTokenBBalance,
        props.slippageTolerancePercentage,
        props.isLiquidityInsufficient,
    ]);

    const { address: account } = useAccount();

    useEffect(() => {
        if (account) {
            setUserClickedCombinedMax(false);
        }
    }, [account]);

    useEffect(() => {
        if (!props.poolExists) {
            props.setSwapAllowed(false);

            if (props.poolExists === undefined) {
                props.setSwapButtonErrorMessage('...');
            } else if (props.poolExists === false) {
                props.setSwapButtonErrorMessage('Pool Not Initialized');
            }
        }
    }, [props.poolExists === undefined, props.poolExists]);

    const handleSwapButtonMessage = useMemo(
        () => (tokenAAmount: number) => {
            if (!props.poolExists || isNaN(tokenAAmount)) {
                return undefined;
            }

            if (props.isLiquidityInsufficient) {
                props.setSwapAllowed(false);
                props.setSwapButtonErrorMessage('Liquidity Insufficient');
            } else if (tokenAAmount <= 0) {
                props.setSwapAllowed(false);
                props.setSwapButtonErrorMessage('Enter an Amount');
            } else if (tokenAQtyLocal === '') {
                props.setSwapButtonErrorMessage('...');
            } else {
                const hurdle = props.isWithdrawFromDexChecked
                    ? parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                    : parseFloat(tokenABalance);
                const balanceLabel = props.isWithdrawFromDexChecked
                    ? 'Exchange'
                    : 'Wallet';

                props.setSwapAllowed(tokenAAmount <= hurdle);

                if (tokenAAmount > hurdle) {
                    props.setSwapButtonErrorMessage(
                        `${tokenASymbolLocal} Exceeds ${balanceLabel} Balance`,
                    );
                }
            }
        },
        [
            props.crocEnv,
            props.poolExists,
            props.poolPriceDisplay,
            tokenALocal,
            tokenBLocal,
            props.slippageTolerancePercentage,
            isTokenAPrimaryLocal,
            tokenAQtyLocal,
            tokenBQtyLocal,
            props.isWithdrawFromDexChecked,
        ],
    );

    async function refreshImpact(
        input: string,
        sellToken: boolean,
    ): Promise<number | undefined> {
        if (input === '' || !props.crocEnv) {
            return undefined;
        }

        const impact = await calcImpact(
            sellToken,
            props.crocEnv,
            tokenALocal,
            tokenBLocal,
            props.slippageTolerancePercentage / 100,
            input,
        );
        props.setPriceImpact(impact);

        isTokenAPrimaryLocal ? setIsBuyLoading(false) : setIsSellLoading(false);

        if (impact) {
            props.setIsLiquidityInsufficient(false);
            return parseFloat(sellToken ? impact.buyQty : impact.sellQty);
        } else {
            props.setIsLiquidityInsufficient(true);
            props.setSwapAllowed(false);
            return undefined;
        }
    }

    const handleTokenAChangeEvent = useMemo(
        () => async (evt?: ChangeEvent<HTMLInputElement>) => {
            if (!props.crocEnv) {
                return;
            }
            let rawTokenBQty = undefined;
            if (evt) {
                setUserClickedCombinedMax(false);

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
                if (!props.poolPriceDisplay) return;

                if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                    props.setSwapAllowed(false);
                    props.setSwapButtonErrorMessage('Enter an Amount');
                    props.setPriceImpact(undefined);
                    isTokenAPrimaryLocal
                        ? setIsBuyLoading(false)
                        : setIsSellLoading(false);

                    if (isNaN(parsedInput) || parsedInput === 0) return;
                }

                rawTokenBQty = await refreshImpact(input, true);
            } else {
                if (!props.poolExists) {
                    props.setSwapAllowed(false);

                    if (props.poolExists === undefined) {
                        props.setSwapButtonErrorMessage('...');
                    } else if (props.poolExists === false) {
                        props.setSwapButtonErrorMessage('Pool Not Initialized');
                    }
                    return;
                }
                if (!(parseFloat(tokenAQtyLocal) > 0)) {
                    props.setSwapAllowed(false);
                    props.setSwapButtonErrorMessage('Enter an Amount');
                    setTokenBQtyLocal('');

                    return;
                }

                handleSwapButtonMessage(parseFloat(tokenAQtyLocal));
                rawTokenBQty = await refreshImpact(tokenAQtyLocal, true);
            }

            const truncatedTokenBQty = rawTokenBQty
                ? rawTokenBQty < 2
                    ? rawTokenBQty.toPrecision(3)
                    : truncateDecimals(rawTokenBQty, 2)
                : '';

            setTokenBQtyLocal(truncatedTokenBQty);
            props.setBuyQtyString(truncatedTokenBQty);
        },
        [
            props.crocEnv,
            props.poolExists,
            props.poolPriceDisplay,
            tokenALocal,
            tokenBLocal,
            props.slippageTolerancePercentage,
            isTokenAPrimaryLocal,
            tokenAQtyLocal,
            tokenBQtyLocal,
        ],
    );

    const handleTokenAChangeClick = useMemo(
        () => async (value: string) => {
            if (!props.crocEnv) {
                return;
            }
            let rawTokenBQty;
            const tokenAInputField = document.getElementById('sell-quantity');
            if (tokenAInputField) {
                (tokenAInputField as HTMLInputElement).value = value;
            }
            if (value) {
                const input = value.replaceAll(',', '');
                props.setSellQtyString(input);
                setTokenAQtyLocal(input);
                setIsTokenAPrimaryLocal(true);
                dispatch(setIsTokenAPrimary(true));
                dispatch(setPrimaryQuantity(input));
                handleSwapButtonMessage(parseFloat(input));

                if (!props.poolPriceDisplay) return;
                rawTokenBQty = await refreshImpact(input, true);
            } else {
                if (tokenAQtyLocal === '' && tokenBQtyLocal === '') {
                    props.setSwapAllowed(false);
                    props.setSwapButtonErrorMessage('Enter an Amount');
                    return;
                }
                handleSwapButtonMessage(parseFloat(tokenAQtyLocal));
                rawTokenBQty = await refreshImpact(tokenAQtyLocal, true);
            }

            const truncatedTokenBQty = rawTokenBQty
                ? rawTokenBQty < 2
                    ? rawTokenBQty.toPrecision(3)
                    : truncateDecimals(rawTokenBQty, 2)
                : '';

            if (truncatedTokenBQty !== tokenBQtyLocal)
                setTokenBQtyLocal(truncatedTokenBQty);
            if (truncatedTokenBQty !== props.buyQtyString)
                props.setBuyQtyString(truncatedTokenBQty);
        },
        [
            props.crocEnv,
            props.poolPriceDisplay,
            props.poolExists,
            tokenALocal,
            tokenBLocal,
            props.slippageTolerancePercentage,
            isTokenAPrimaryLocal,
        ],
    );

    const handleTokenBChangeEvent = useMemo(
        () => async (evt?: ChangeEvent<HTMLInputElement>) => {
            if (!props.crocEnv) {
                return;
            }

            let rawTokenAQty: number | undefined;
            if (evt) {
                setUserClickedCombinedMax(false);

                const input = evt.target.value.startsWith('.')
                    ? '0' + evt.target.value.replaceAll(',', '')
                    : evt.target.value.replaceAll(',', '');

                setTokenBQtyLocal(input);
                setIsTokenAPrimaryLocal(false);
                dispatch(setIsTokenAPrimary(false));
                dispatch(setPrimaryQuantity(input));

                if (
                    props.tokenPair.dataTokenA.address ===
                    props.tokenPair.dataTokenB.address
                ) {
                    return;
                }
                const parsedInput = parseFloat(input);

                if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                    props.setSwapAllowed(false);
                    props.setSwapButtonErrorMessage('Enter an Amount');
                    props.setPriceImpact(undefined);
                    isTokenAPrimaryLocal
                        ? setIsBuyLoading(false)
                        : setIsSellLoading(false);
                    if (isNaN(parsedInput) || parsedInput === 0) return;
                }

                rawTokenAQty = await refreshImpact(input, false);
                rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
            } else {
                if (!props.poolExists) {
                    props.setSwapAllowed(false);

                    if (props.poolExists === undefined) {
                        props.setSwapButtonErrorMessage('...');
                    } else if (props.poolExists === false) {
                        props.setSwapButtonErrorMessage('Pool Not Initialized');
                    }
                    return;
                }
                if (!(parseFloat(tokenBQtyLocal) > 0)) {
                    props.setSwapAllowed(false);
                    props.setSwapButtonErrorMessage('Enter an Amount');
                    setTokenAQtyLocal('');

                    return;
                }

                rawTokenAQty = await refreshImpact(tokenBQtyLocal, false);
                handleSwapButtonMessage(rawTokenAQty ?? 0);
            }

            const truncatedTokenAQty = rawTokenAQty
                ? rawTokenAQty < 2
                    ? rawTokenAQty.toPrecision(3)
                    : truncateDecimals(rawTokenAQty, 2)
                : '';

            if (truncatedTokenAQty !== tokenAQtyLocal)
                setTokenAQtyLocal(truncatedTokenAQty);

            if (truncatedTokenAQty !== props.sellQtyString)
                props.setSellQtyString(truncatedTokenAQty);
        },
        [
            props.crocEnv,
            props.poolPriceDisplay,
            props.poolExists,
            tokenALocal,
            tokenBLocal,
            props.slippageTolerancePercentage,
            isTokenAPrimaryLocal,
            tokenAQtyLocal,
            tokenBQtyLocal,
        ],
    );

    return (
        <section
            className={`${styles.currency_converter} ${
                switchBoxes ? styles.currency_converter_switch : null
            }`}
        >
            <CurrencySelector
                provider={props.provider}
                disableReverseTokens={disableReverseTokens}
                sellQtyString={props.sellQtyString}
                setSellQtyString={props.setSellQtyString}
                buyQtyString={props.buyQtyString}
                setBuyQtyString={props.setBuyQtyString}
                isUserLoggedIn={props.isUserLoggedIn}
                tokenPair={props.tokenPair}
                chainId={props.chainId}
                direction={props.isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                isLoading={isSellLoading}
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
                isWithdrawFromDexChecked={props.isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={props.setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={props.isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={
                    props.setIsSaveAsDexSurplusChecked
                }
                reverseTokens={reverseTokens}
                isSwapCopied={props.isSwapCopied}
                importedTokensPlus={props.importedTokensPlus}
                getRecentTokens={props.getRecentTokens}
                addRecentToken={props.addRecentToken}
                outputTokens={props.outputTokens}
                validatedInput={props.validatedInput}
                setInput={props.setInput}
                searchType={props.searchType}
                setDisableReverseTokens={setDisableReverseTokens}
                tokens={props.tokens}
                setUserOverrodeSurplusWithdrawalDefault={
                    setUserOverrodeSurplusWithdrawalDefault
                }
                setUserClickedCombinedMax={setUserClickedCombinedMax}
                userClickedCombinedMax={userClickedCombinedMax}
                setIsSellLoading={setIsSellLoading}
                setIsBuyLoading={setIsBuyLoading}
            />
            <div
                className={
                    disableReverseTokens
                        ? styles.arrow_container_disabled
                        : styles.arrow_container
                }
                onClick={reverseTokens}
            >
                {props.isLiq ? null : (
                    <TokensArrow disabled={disableReverseTokens} />
                )}
            </div>
            <div id='swap_currency_converter'>
                <CurrencySelector
                    provider={props.provider}
                    disableReverseTokens={disableReverseTokens}
                    sellQtyString={props.sellQtyString}
                    setSellQtyString={props.setSellQtyString}
                    setBuyQtyString={props.setBuyQtyString}
                    buyQtyString={props.buyQtyString}
                    isUserLoggedIn={props.isUserLoggedIn}
                    tokenBQtyLocal={tokenBQtyLocal}
                    tokenPair={props.tokenPair}
                    chainId={props.chainId}
                    direction={props.isLiq ? '' : 'To:'}
                    fieldId='buy'
                    isLoading={isBuyLoading}
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
                    isWithdrawFromDexChecked={props.isWithdrawFromDexChecked}
                    setIsWithdrawFromDexChecked={
                        props.setIsWithdrawFromDexChecked
                    }
                    isSaveAsDexSurplusChecked={props.isSaveAsDexSurplusChecked}
                    reverseTokens={reverseTokens}
                    setIsSaveAsDexSurplusChecked={
                        props.setIsSaveAsDexSurplusChecked
                    }
                    isSwapCopied={props.isSwapCopied}
                    importedTokensPlus={props.importedTokensPlus}
                    getRecentTokens={props.getRecentTokens}
                    addRecentToken={props.addRecentToken}
                    outputTokens={props.outputTokens}
                    validatedInput={props.validatedInput}
                    setInput={props.setInput}
                    searchType={props.searchType}
                    setDisableReverseTokens={setDisableReverseTokens}
                    tokens={props.tokens}
                    setUserOverrodeSurplusWithdrawalDefault={
                        setUserOverrodeSurplusWithdrawalDefault
                    }
                    setUserClickedCombinedMax={setUserClickedCombinedMax}
                    userClickedCombinedMax={userClickedCombinedMax}
                    setIsSellLoading={setIsSellLoading}
                    setIsBuyLoading={setIsBuyLoading}
                />
            </div>
        </section>
    );
}

export default memo(CurrencyConverter);

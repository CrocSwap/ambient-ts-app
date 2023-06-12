import {
    ChangeEvent,
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import {
    setIsTokenAPrimary,
    setPrimaryQuantity,
    setShouldSwapDirectionReverse,
} from '../../../utils/state/tradeDataSlice';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import { CrocImpact, sortBaseQuoteTokens } from '@crocswap-libs/sdk';
import { calcImpact } from '../../../App/functions/calcImpact';
import { ZERO_ADDRESS } from '../../../constants';
import { formSlugForPairParams } from '../../../App/functions/urlSlugs';
import { useAccount } from 'wagmi';
import { shallowEqual } from 'react-redux';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { useLinkGen, linkGenMethodsIF } from '../../../utils/hooks/useLinkGen';

interface propsIF {
    slippageTolerancePercentage: number;
    setPriceImpact: Dispatch<SetStateAction<CrocImpact | undefined>>;
    isLiq: boolean;
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
    setTokenAQtyCoveredByWalletBalance: Dispatch<SetStateAction<number>>;
    isLiquidityInsufficient: boolean;
    setIsLiquidityInsufficient: Dispatch<SetStateAction<boolean>>;
}

function CurrencyConverter(props: propsIF) {
    const {
        isLiquidityInsufficient,
        setIsLiquidityInsufficient,
        slippageTolerancePercentage,
        setPriceImpact,
        isLiq,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        setSwapAllowed,
        setSwapButtonErrorMessage,
        sellQtyString,
        buyQtyString,
        setSellQtyString,
        setBuyQtyString,
        setTokenAQtyCoveredByWalletBalance,
    } = props;

    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { poolPriceDisplay, isPoolInitialized } = useContext(PoolContext);
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

    const { tokenA, tokenB, isTokenAPrimary, primaryQuantity } = useAppSelector(
        (state) => ({
            tokenA: state.tradeData.tokenA,
            tokenB: state.tradeData.tokenB,
            isTokenAPrimary: state.tradeData.isTokenAPrimary,
            primaryQuantity: state.tradeData.primaryQuantity,
        }),
        shallowEqual,
    );

    const { lastBlockNumber } = useContext(ChainDataContext);

    const [tokenALocal, setTokenALocal] = useState<string>(tokenA.address);
    const [tokenBLocal, setTokenBLocal] = useState<string>(tokenB.address);
    const [tokenASymbolLocal, setTokenASymbolLocal] = useState<string>(
        tokenA.symbol,
    );
    const [tokenBSymbolLocal, setTokenBSymbolLocal] = useState<string>(
        tokenB.symbol,
    );

    const [isSellLoading, setIsSellLoading] = useState(false);
    const [isBuyLoading, setIsBuyLoading] = useState(false);

    const isSellTokenEth = tokenA.address === ZERO_ADDRESS;

    useEffect(() => {
        setTokenALocal(tokenA.address);
        setTokenASymbolLocal(tokenA.symbol);
    }, [tokenA.address, tokenA.symbol, chainId]);

    useEffect(() => {
        setTokenBLocal(tokenB.address);
        setTokenBSymbolLocal(tokenB.symbol);
    }, [tokenB.address, tokenB.symbol, chainId]);

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

    // hook to generate navigation actions with pre-loaded path
    const linkGenAny: linkGenMethodsIF = useLinkGen();

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
    const combinedTokenBBalance = tokenBBalance + tokenBDexBalance;

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAQtyLocal || '0');

    const tokenAQtyCoveredByWalletBalance = isWithdrawFromDexChecked
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
                tokenA.chainId,
                tokenB.address,
                tokenA.address,
            )
        );
    }, [pathname, tokenB.address, tokenA.address]);

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

    const reverseTokens = useCallback((): void => {
        if (disableReverseTokens || !isPoolInitialized) {
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
            linkGenAny.navigate({
                chain: chainId,
                tokenA: tokenB.address,
                tokenB: tokenA.address,
            });
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
    }, [
        crocEnv,
        poolPriceDisplay,
        tokenALocal,
        tokenBLocal,
        slippageTolerancePercentage,
        isTokenAPrimaryLocal,
        linkPathReversed,
        disableReverseTokens,
    ]);

    const handleBlockUpdate = () => {
        if (!disableReverseTokens) {
            setDisableReverseTokens(true);

            isTokenAPrimaryLocal
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    };

    const tradeData = useAppSelector((state) => state.tradeData);

    useEffect(() => {
        handleBlockUpdate();
    }, [lastBlockNumber]);

    useEffect(() => {
        if (tradeData.shouldSwapDirectionReverse) {
            setIsTokenAPrimaryLocal((state) => {
                reverseTokens();
                return !state;
            });
            dispatch(setShouldSwapDirectionReverse(false));
        }
    }, [tradeData.shouldSwapDirectionReverse]);

    useEffect(() => {
        isTokenAPrimaryLocal
            ? handleTokenAChangeEvent()
            : handleTokenBChangeEvent();
    }, [
        crocEnv,
        isPoolInitialized,
        tokenALocal + tokenBLocal,
        isTokenAPrimaryLocal,
        combinedTokenABalance,
        combinedTokenBBalance,
        slippageTolerancePercentage,
        isLiquidityInsufficient,
    ]);

    const { address: account } = useAccount();

    useEffect(() => {
        if (account) {
            setUserClickedCombinedMax(false);
        }
    }, [account]);

    const [isImpactCalculating, setImpactCalculating] =
        useState<boolean>(false);

    useEffect(() => {
        if (isSellLoading || isBuyLoading) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('...');
        } else if (isPoolInitialized === false) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Pool Not Initialized');
        } else if (isNaN(parseFloat(tokenAQtyLocal))) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else if (isLiquidityInsufficient) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Liquidity Insufficient');
        } else if (parseFloat(tokenAQtyLocal) <= 0) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else {
            const hurdle = isWithdrawFromDexChecked
                ? parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                : parseFloat(tokenABalance);
            const balanceLabel = isWithdrawFromDexChecked
                ? 'Exchange'
                : 'Wallet';

            setSwapAllowed(parseFloat(tokenAQtyLocal) <= hurdle);

            if (parseFloat(tokenAQtyLocal) > hurdle) {
                setSwapAllowed(false);
                setSwapButtonErrorMessage(
                    `${tokenASymbolLocal} Exceeds ${balanceLabel} Balance`,
                );
            } else {
                setSwapAllowed(true);
            }
        }
    }, [
        crocEnv,
        isPoolInitialized,
        isPoolInitialized === undefined, // Needed to distinguish false from undefined
        poolPriceDisplay,
        tokenALocal,
        tokenBLocal,
        slippageTolerancePercentage,
        isTokenAPrimaryLocal,
        tokenAQtyLocal,
        tokenBQtyLocal,
        isWithdrawFromDexChecked,
        isImpactCalculating,
        isBuyLoading,
        isSellLoading,
    ]);

    async function refreshImpact(
        input: string,
        sellToken: boolean,
    ): Promise<number | undefined> {
        if (isNaN(parseFloat(input)) || parseFloat(input) === 0 || !crocEnv) {
            return undefined;
        }

        setImpactCalculating(true);
        const impact = await calcImpact(
            sellToken,
            crocEnv,
            tokenALocal,
            tokenBLocal,
            slippageTolerancePercentage / 100,
            input,
        );
        setImpactCalculating(false);
        setPriceImpact(impact);

        isTokenAPrimaryLocal ? setIsBuyLoading(false) : setIsSellLoading(false);

        if (impact) {
            setIsLiquidityInsufficient(false);
            return parseFloat(sellToken ? impact.buyQty : impact.sellQty);
        } else {
            setIsLiquidityInsufficient(true);
            setSwapAllowed(false);
            return undefined;
        }
    }

    const handleTokenAChangeEvent = useMemo(
        () => async (evt?: ChangeEvent<HTMLInputElement>) => {
            if (!crocEnv) return;
            let rawTokenBQty = undefined;
            if (evt) {
                setUserClickedCombinedMax(false);

                const targetValue = evt.target.value.replaceAll(',', '');

                const input = targetValue.startsWith('.')
                    ? '0' + targetValue
                    : targetValue;

                setTokenAQtyLocal(input);
                setIsTokenAPrimaryLocal(true);
                dispatch(setIsTokenAPrimary(true));
                dispatch(setPrimaryQuantity(input));

                rawTokenBQty = await refreshImpact(input, true);
            } else {
                rawTokenBQty = await refreshImpact(tokenAQtyLocal, true);
            }

            const truncatedTokenBQty = rawTokenBQty
                ? rawTokenBQty < 2
                    ? rawTokenBQty.toPrecision(3)
                    : truncateDecimals(rawTokenBQty, 2)
                : '';

            setTokenBQtyLocal(truncatedTokenBQty);
            setBuyQtyString(truncatedTokenBQty);
        },
        [
            crocEnv,
            isPoolInitialized,
            poolPriceDisplay,
            tokenALocal,
            tokenBLocal,
            slippageTolerancePercentage,
            isTokenAPrimaryLocal,
            tokenAQtyLocal,
            tokenBQtyLocal,
        ],
    );

    const handleTokenAChangeClick = useMemo(
        () => async (value: string) => {
            if (!crocEnv) return;
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

                rawTokenBQty = await refreshImpact(input, true);
            } else {
                rawTokenBQty = await refreshImpact(tokenAQtyLocal, true);
            }

            const truncatedTokenBQty = rawTokenBQty
                ? rawTokenBQty < 2
                    ? rawTokenBQty.toPrecision(3)
                    : truncateDecimals(rawTokenBQty, 2)
                : '';

            setTokenBQtyLocal(truncatedTokenBQty);
            setBuyQtyString(truncatedTokenBQty);
        },
        [
            crocEnv,
            poolPriceDisplay,
            isPoolInitialized,
            tokenALocal,
            tokenBLocal,
            slippageTolerancePercentage,
            isTokenAPrimaryLocal,
        ],
    );

    const handleTokenBChangeEvent = useMemo(
        () => async (evt?: ChangeEvent<HTMLInputElement>) => {
            if (!crocEnv) return;

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

                rawTokenAQty = await refreshImpact(input, false);
            } else {
                rawTokenAQty = await refreshImpact(tokenBQtyLocal, false);
            }

            const truncatedTokenAQty = rawTokenAQty
                ? rawTokenAQty < 2
                    ? rawTokenAQty.toPrecision(3)
                    : truncateDecimals(rawTokenAQty, 2)
                : '';
            setTokenAQtyLocal(truncatedTokenAQty);
            setSellQtyString(truncatedTokenAQty);
        },
        [
            crocEnv,
            poolPriceDisplay,
            isPoolInitialized,
            tokenALocal,
            tokenBLocal,
            slippageTolerancePercentage,
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
                disableReverseTokens={disableReverseTokens}
                sellQtyString={sellQtyString}
                setSellQtyString={setSellQtyString}
                buyQtyString={buyQtyString}
                setBuyQtyString={setBuyQtyString}
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
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                reverseTokens={reverseTokens}
                setDisableReverseTokens={setDisableReverseTokens}
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
                {isLiq ? null : <TokensArrow disabled={disableReverseTokens} />}
            </div>
            <div id='swap_currency_converter'>
                <CurrencySelector
                    disableReverseTokens={disableReverseTokens}
                    sellQtyString={sellQtyString}
                    setSellQtyString={setSellQtyString}
                    setBuyQtyString={setBuyQtyString}
                    buyQtyString={buyQtyString}
                    fieldId='buy'
                    isLoading={isBuyLoading}
                    tokenAorB={'B'}
                    handleChangeEvent={handleTokenBChangeEvent}
                    tokenABalance={tokenABalance}
                    tokenBBalance={tokenBBalance}
                    tokenADexBalance={tokenADexBalance}
                    tokenBDexBalance={tokenBDexBalance}
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    reverseTokens={reverseTokens}
                    setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                    setDisableReverseTokens={setDisableReverseTokens}
                    setUserOverrodeSurplusWithdrawalDefault={
                        setUserOverrodeSurplusWithdrawalDefault
                    }
                    setUserClickedCombinedMax={setUserClickedCombinedMax}
                    userClickedCombinedMax={userClickedCombinedMax}
                    setIsSellLoading={setIsSellLoading}
                    setIsBuyLoading={setIsBuyLoading}
                    isTokenAPrimaryLocal={isTokenAPrimaryLocal}
                    handleTokenAChangeEvent={handleTokenAChangeEvent}
                    handleTokenBChangeEvent={handleTokenBChangeEvent}
                />
            </div>
        </section>
    );
}

export default memo(CurrencyConverter);

// START: Import React and Dongles
import {
    ChangeEvent,
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimary,
    setLimitTick,
    setPoolPriceNonDisplay,
    setPrimaryQuantity,
} from '../../../../utils/state/tradeDataSlice';

import truncateDecimals from '../../../../utils/data/truncateDecimals';

// START: Import React Functional Components
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';
import LimitRate from '../LimitRate/LimitRate';

// START: Import Local Files
import styles from './LimitCurrencyConverter.module.css';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

// interface for component props
interface propsIF {
    displayPrice: string;
    previousDisplayPrice: string;
    setPreviousDisplayPrice: Dispatch<SetStateAction<string>>;
    setDisplayPrice: Dispatch<SetStateAction<string>>;
    setPriceInputFieldBlurred: Dispatch<SetStateAction<boolean>>;
    limitTickDisplayPrice: number;
    setIsSellTokenPrimary?: Dispatch<SetStateAction<boolean>>;
    setLimitAllowed: Dispatch<SetStateAction<boolean>>;
    isSellTokenBase: boolean;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    setLimitButtonErrorMessage: Dispatch<SetStateAction<string>>;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    isOrderValid: boolean;
    setTokenAQtyCoveredByWalletBalance: Dispatch<SetStateAction<number>>;
}

// central react functional component
function LimitCurrencyConverter(props: propsIF) {
    const {
        displayPrice,
        previousDisplayPrice,
        setDisplayPrice,
        setPreviousDisplayPrice,
        setPriceInputFieldBlurred,
        limitTickDisplayPrice,
        setLimitAllowed,
        isSellTokenBase,
        tokenAInputQty,
        tokenBInputQty,
        setTokenAInputQty,
        setTokenBInputQty,
        setLimitButtonErrorMessage,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        isOrderValid,
        setTokenAQtyCoveredByWalletBalance,
    } = props;

    const dispatch = useAppDispatch();

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

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const tradeData = useAppSelector((state) => state.tradeData);

    const isTokenAPrimary = tradeData.isTokenAPrimary;

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] =
        useState<boolean>(isTokenAPrimary);
    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );

    const isSellTokenEth = tradeData.tokenA.address === ZERO_ADDRESS;

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

    const tokenASurplusMinusTokenARemainderNum =
        parseFloat(tokenADexBalance || '0') - parseFloat(tokenAQtyLocal || '0');
    const tokenASurplusMinusTokenAQtyNum =
        tokenASurplusMinusTokenARemainderNum >= 0
            ? tokenASurplusMinusTokenARemainderNum
            : 0;
    const tokenAWalletMinusTokenAQtyNum =
        isWithdrawFromDexChecked && tokenASurplusMinusTokenARemainderNum < 0
            ? parseFloat(tokenABalance || '0') +
              tokenASurplusMinusTokenARemainderNum
            : isWithdrawFromDexChecked
            ? parseFloat(tokenABalance || '0')
            : parseFloat(tokenABalance || '0') -
              parseFloat(tokenAQtyLocal || '0');

    const [
        userOverrodeSurplusWithdrawalDefault,
        setUserOverrodeSurplusWithdrawalDefault,
    ] = useState<boolean>(false);

    const [resetLimitTick, setResetLimitTick] = useState(true);

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
        if (tradeData) {
            if (isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
            } else {
                setTokenBInputQty(tradeData.primaryQuantity);
            }
        }
    }, []);

    const [disableReverseTokens, setDisableReverseTokens] = useState(false);

    useEffect(() => {
        if (disableReverseTokens) {
            const timer = setTimeout(() => {
                setDisableReverseTokens(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [disableReverseTokens]);

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const reverseTokens = (): void => {
        if (disableReverseTokens) {
            return;
        } else {
            setDisableReverseTokens(true);
            dispatch(setLimitTick(undefined));
            dispatch(setIsTokenAPrimary(!isTokenAPrimary));
            dispatch(setPoolPriceNonDisplay(0));
            IS_LOCAL_ENV && console.debug({ isTokenAPrimaryLocal });
            linkGenLimit.navigate({
                chain: chainId,
                tokenA: tradeData.tokenB.address,
                tokenB: tradeData.tokenA.address,
            });
            if (!isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
            } else {
                setTokenBInputQty(tradeData.primaryQuantity);
            }
        }
    };

    useEffect(() => {
        if (tradeData.shouldLimitDirectionReverse) {
            setIsTokenAPrimaryLocal((state) => {
                reverseTokens();
                return !state;
            });
        }
    }, [tradeData.shouldLimitDirectionReverse]);

    useEffect(() => {
        isTokenAPrimaryLocal
            ? handleTokenAChangeEvent()
            : handleTokenBChangeEvent();
    }, [
        isPoolInitialized,
        limitTickDisplayPrice,
        isSellTokenBase,
        isTokenAPrimaryLocal,
        tokenABalance,
        isWithdrawFromDexChecked,
        tradeData.shouldLimitConverterUpdate,
        isUserConnected,
        isOrderValid,
    ]);

    const handleLimitButtonMessage = (tokenAAmount: number) => {
        if (!isPoolInitialized) {
            setLimitAllowed(false);
            if (isPoolInitialized === undefined)
                setLimitButtonErrorMessage('...');
            if (isPoolInitialized === false)
                setLimitButtonErrorMessage('Pool Not Initialized');
        } else if (!isOrderValid) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage(
                `Limit ${
                    (isSellTokenBase && !tradeData.isDenomBase) ||
                    (!isSellTokenBase && tradeData.isDenomBase)
                        ? 'Above Maximum'
                        : 'Below Minimum'
                }  Price`,
            );
        } else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setLimitAllowed(false);
            setLimitButtonErrorMessage('Enter an Amount');
        } else {
            if (isWithdrawFromDexChecked) {
                if (
                    tokenAAmount >
                    parseFloat(tokenADexBalance) + parseFloat(tokenABalance)
                ) {
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${tradeData.tokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
                    );
                } else {
                    setLimitAllowed(true);
                }
            } else {
                if (tokenAAmount > parseFloat(tokenABalance)) {
                    setLimitAllowed(false);
                    setLimitButtonErrorMessage(
                        `${tradeData.tokenA.symbol} Amount Exceeds Wallet Balance`,
                    );
                } else {
                    setLimitAllowed(true);
                }
            }
        }
    };

    const handleTokenAChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenBQty: number;

        if (evt) {
            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            const parsedInput = parseFloat(input);
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setLimitAllowed(false);
                setLimitButtonErrorMessage('Enter an Amount');
                setTokenAQtyLocal('');
                setTokenAInputQty(input);
                if (input !== '') return;
            }

            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));

            if (!tradeData.isDenomBase) {
                rawTokenBQty = isSellTokenBase
                    ? (1 / limitTickDisplayPrice) * parseFloat(input)
                    : limitTickDisplayPrice * parseFloat(input);
            } else {
                rawTokenBQty = !isSellTokenBase
                    ? (1 / limitTickDisplayPrice) * parseFloat(input)
                    : limitTickDisplayPrice * parseFloat(input);
            }
            handleLimitButtonMessage(parseFloat(input));
        } else {
            if (!tradeData.isDenomBase) {
                rawTokenBQty = isSellTokenBase
                    ? (1 / limitTickDisplayPrice) *
                      parseFloat(tradeData.primaryQuantity)
                    : limitTickDisplayPrice *
                      parseFloat(tradeData.primaryQuantity);
            } else {
                rawTokenBQty = !isSellTokenBase
                    ? (1 / limitTickDisplayPrice) *
                      parseFloat(tradeData.primaryQuantity)
                    : limitTickDisplayPrice *
                      parseFloat(tradeData.primaryQuantity);
            }
            handleLimitButtonMessage(parseFloat(tokenAQtyLocal));
        }

        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        setTokenBInputQty(truncatedTokenBQty);
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

        if (!tradeData.isDenomBase) {
            rawTokenBQty = isSellTokenBase
                ? (1 / limitTickDisplayPrice) * parseFloat(input)
                : limitTickDisplayPrice * parseFloat(input);
        } else {
            rawTokenBQty = !isSellTokenBase
                ? (1 / limitTickDisplayPrice) * parseFloat(input)
                : limitTickDisplayPrice * parseFloat(input);
        }

        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';
        handleLimitButtonMessage(parseFloat(input));

        setTokenBInputQty(truncatedTokenBQty);
    };

    const [userSetTokenBToZero, setUserSetTokenBToZero] =
        useState<boolean>(false);

    const handleTokenBChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        let rawTokenAQty;
        if (evt) {
            const input = evt.target.value.startsWith('.')
                ? '0' + evt.target.value
                : evt.target.value;

            const parsedInput = parseFloat(input);
            if (input === '' || isNaN(parsedInput) || parsedInput === 0) {
                setLimitAllowed(false);
                setLimitButtonErrorMessage('Enter an Amount');
                setUserSetTokenBToZero(true);
                if (input !== '') return;
            }
            setUserSetTokenBToZero(false);

            setTokenBInputQty(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            if (!tradeData.isDenomBase) {
                rawTokenAQty = isSellTokenBase
                    ? limitTickDisplayPrice * parseFloat(input)
                    : (1 / limitTickDisplayPrice) * parseFloat(input);
            } else {
                rawTokenAQty = !isSellTokenBase
                    ? limitTickDisplayPrice * parseFloat(input)
                    : (1 / limitTickDisplayPrice) * parseFloat(input);
            }

            handleLimitButtonMessage(rawTokenAQty);
        } else {
            if (!tradeData.isDenomBase) {
                rawTokenAQty = isSellTokenBase
                    ? limitTickDisplayPrice *
                      parseFloat(tradeData.primaryQuantity)
                    : // ? limitTickDisplayPrice * parseFloat(tokenBQtyLocal)
                      (1 / limitTickDisplayPrice) *
                      parseFloat(tradeData.primaryQuantity);
            } else {
                rawTokenAQty = !isSellTokenBase
                    ? limitTickDisplayPrice *
                      parseFloat(tradeData.primaryQuantity)
                    : (1 / limitTickDisplayPrice) *
                      parseFloat(tradeData.primaryQuantity);
            }

            handleLimitButtonMessage(userSetTokenBToZero ? 0 : rawTokenAQty);
        }
        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 2
                ? rawTokenAQty.toPrecision(3)
                : truncateDecimals(rawTokenAQty, 2)
            : '';

        setTokenAQtyLocal(truncatedTokenAQty);
        setTokenAInputQty(truncatedTokenAQty);
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

    useEffect(() => {
        setTokenAQtyCoveredByWalletBalance(tokenAQtyCoveredByWalletBalance);
    }, [tokenAQtyCoveredByWalletBalance]);

    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector
                tokenAInputQty={tokenAInputQty}
                tokenBInputQty={tokenBInputQty}
                setTokenAInputQty={setTokenAInputQty}
                setTokenBInputQty={setTokenBInputQty}
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
                tokenAQtyCoveredByWalletBalance={
                    tokenAQtyCoveredByWalletBalance
                }
                tokenAQtyCoveredBySurplusBalance={
                    tokenAQtyCoveredBySurplusBalance
                }
                tokenAWalletMinusTokenAQtyNum={tokenAWalletMinusTokenAQtyNum}
                tokenASurplusMinusTokenAQtyNum={tokenASurplusMinusTokenAQtyNum}
                tokenASurplusMinusTokenARemainderNum={
                    tokenASurplusMinusTokenARemainderNum
                }
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                tokenAorB={'A'}
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
                onClick={() => {
                    if (!disableReverseTokens) {
                        if (resetLimitTick) {
                            dispatch(setPoolPriceNonDisplay(0));
                            dispatch(setLimitTick(undefined));
                            setResetLimitTick(false);
                        }
                        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
                        reverseTokens();
                    }
                }}
            >
                <IconWithTooltip title='Reverse tokens' placement='left'>
                    <TokensArrow disabled={disableReverseTokens} />
                </IconWithTooltip>
            </div>
            <div id='limit_currency_converter'>
                <LimitCurrencySelector
                    tokenAInputQty={tokenAInputQty}
                    tokenBInputQty={tokenBInputQty}
                    setTokenAInputQty={setTokenAInputQty}
                    setTokenBInputQty={setTokenBInputQty}
                    fieldId='buy'
                    direction='To: '
                    handleChangeEvent={handleTokenBChangeEvent}
                    reverseTokens={reverseTokens}
                    tokenABalance={tokenABalance}
                    tokenBBalance={tokenBBalance}
                    tokenADexBalance={tokenADexBalance}
                    tokenBDexBalance={tokenBDexBalance}
                    tokenAQtyCoveredByWalletBalance={
                        tokenAQtyCoveredByWalletBalance
                    }
                    tokenAQtyCoveredBySurplusBalance={
                        tokenAQtyCoveredBySurplusBalance
                    }
                    tokenAWalletMinusTokenAQtyNum={
                        tokenAWalletMinusTokenAQtyNum
                    }
                    tokenASurplusMinusTokenAQtyNum={
                        tokenASurplusMinusTokenAQtyNum
                    }
                    tokenASurplusMinusTokenARemainderNum={
                        tokenASurplusMinusTokenARemainderNum
                    }
                    isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                    setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                    isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                    setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                    tokenAorB={'B'}
                    setUserOverrodeSurplusWithdrawalDefault={
                        setUserOverrodeSurplusWithdrawalDefault
                    }
                />
            </div>
            <LimitRate
                previousDisplayPrice={previousDisplayPrice}
                displayPrice={displayPrice}
                setDisplayPrice={setDisplayPrice}
                setPreviousDisplayPrice={setPreviousDisplayPrice}
                isSellTokenBase={isSellTokenBase}
                setPriceInputFieldBlurred={setPriceInputFieldBlurred}
                fieldId='limit-rate'
                reverseTokens={reverseTokens}
                limitTickDisplayPrice={limitTickDisplayPrice}
            />
        </section>
    );
}

export default memo(LimitCurrencyConverter);

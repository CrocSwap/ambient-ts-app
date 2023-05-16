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
import { useNavigate } from 'react-router-dom';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { ethers } from 'ethers';
import {
    // reverseTokensInRTK,
    setIsTokenAPrimary,
    setLimitTick,
    // setLimitTick,
    setPoolPriceNonDisplay,
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
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';
import { ackTokensMethodsIF } from '../../../../App/hooks/useAckTokens';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import { PoolContext } from '../../../../contexts/PoolContext';

// interface for component props
interface propsIF {
    displayPrice: string;
    previousDisplayPrice: string;
    setPreviousDisplayPrice: Dispatch<SetStateAction<string>>;
    setDisplayPrice: Dispatch<SetStateAction<string>>;
    provider?: ethers.providers.Provider;
    setPriceInputFieldBlurred: Dispatch<SetStateAction<boolean>>;
    tokenPair: TokenPairIF;
    poolPriceNonDisplay: number | undefined;
    limitTickDisplayPrice: number;
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
    isDenominationInBase: boolean;
    setResetLimitTick: Dispatch<SetStateAction<boolean>>;

    isOrderCopied: boolean;
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
    ackTokens: ackTokensMethodsIF;
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
        provider,
        setPriceInputFieldBlurred,
        tokenPair,
        poolPriceNonDisplay,
        limitTickDisplayPrice,
        setLimitAllowed,
        isSellTokenBase,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenAInputQty,
        tokenBInputQty,
        setTokenAInputQty,
        setTokenBInputQty,
        setLimitButtonErrorMessage,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        isDenominationInBase,
        isOrderCopied,
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
        setResetLimitTick,
        ackTokens,
        isOrderValid,
        setTokenAQtyCoveredByWalletBalance,
    } = props;

    const dispatch = useAppDispatch();

    const { isPoolInitialized } = useContext(PoolContext);

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

    const navigate = useNavigate();

    const reverseTokens = (): void => {
        if (disableReverseTokens) {
            return;
        } else {
            setDisableReverseTokens(true);
            IS_LOCAL_ENV && console.debug({ isTokenAPrimaryLocal });
            navigate(
                '/trade/limit/' +
                    formSlugForPairParams(
                        tokenPair.dataTokenA.chainId,
                        tokenPair.dataTokenB,
                        tokenPair.dataTokenA,
                    ),
            );
            if (!isTokenAPrimaryLocal) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
            } else {
                setTokenBInputQty(tradeData.primaryQuantity);
            }
            dispatch(setIsTokenAPrimary(!isTokenAPrimary));
            dispatch(setPoolPriceNonDisplay(0));
            if (!tradeData.shouldLimitDirectionReverse) {
                dispatch(setLimitTick(undefined));
            }
        }
    };

    useEffect(() => {
        if (tradeData.shouldLimitDirectionReverse) {
            reverseTokens();
            setIsTokenAPrimaryLocal((state) => {
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
                    (isSellTokenBase && !isDenominationInBase) ||
                    (!isSellTokenBase && isDenominationInBase)
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
                        `${tokenPair.dataTokenA.symbol} Amount Exceeds Combined Wallet and Exchange Balance`,
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

            if (!isDenominationInBase) {
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
            if (!isDenominationInBase) {
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

        if (!isDenominationInBase) {
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

            if (!isDenominationInBase) {
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
            if (!isDenominationInBase) {
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
                provider={provider}
                tokenPair={tokenPair}
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
                isOrderCopied={isOrderCopied}
                verifyToken={verifyToken}
                getTokensByName={getTokensByName}
                getTokenByAddress={getTokenByAddress}
                importedTokensPlus={importedTokensPlus}
                getRecentTokens={getRecentTokens}
                addRecentToken={addRecentToken}
                tokenAorB={'A'}
                outputTokens={outputTokens}
                validatedInput={validatedInput}
                setInput={setInput}
                searchType={searchType}
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
                onClick={() => {
                    if (!disableReverseTokens) {
                        setResetLimitTick((value) => !value);
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
                    tokenPair={tokenPair}
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
                    isOrderCopied={isOrderCopied}
                    verifyToken={verifyToken}
                    getTokensByName={getTokensByName}
                    getTokenByAddress={getTokenByAddress}
                    importedTokensPlus={importedTokensPlus}
                    getRecentTokens={getRecentTokens}
                    addRecentToken={addRecentToken}
                    tokenAorB={'B'}
                    outputTokens={outputTokens}
                    validatedInput={validatedInput}
                    setInput={setInput}
                    searchType={searchType}
                    ackTokens={ackTokens}
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
                tokenPair={tokenPair}
                fieldId='limit-rate'
                reverseTokens={reverseTokens}
                poolPriceNonDisplay={poolPriceNonDisplay}
                limitTickDisplayPrice={limitTickDisplayPrice}
                isOrderCopied={isOrderCopied}
            />
        </section>
    );
}

export default memo(LimitCurrencyConverter);

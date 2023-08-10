import { Dispatch, SetStateAction, useContext, useEffect, memo } from 'react';
import { ZERO_ADDRESS } from '../../../../constants';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import truncateDecimals from '../../../../utils/data/truncateDecimals';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { formatTokenInput } from '../../../../utils/numbers';
import {
    setLimitTick,
    setPoolPriceNonDisplay,
    setIsTokenAPrimary,
    setShouldLimitDirectionReverse,
    setPrimaryQuantity,
    setIsTokenAPrimaryRange,
} from '../../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import TokenInput from '../../../Global/TokenInput/TokenInput';
import styles from '../../../Global/TokenInput/TokenInput.module.css';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';

interface propsIF {
    tokenAInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    tokenBInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    limitTickDisplayPrice: number;
    isWithdrawFromDexChecked: boolean;
    isSaveAsDexSurplusChecked: boolean;
    handleLimitButtonMessage: (val: number) => void;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
}

function LimitTokenInput(props: propsIF) {
    const {
        tokenAInputQty: { value: tokenAInputQty, set: setTokenAInputQty },
        tokenBInputQty: { value: tokenBInputQty, set: setTokenBInputQty },
        limitTickDisplayPrice,
        isWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        handleLimitButtonMessage,
        toggleDexSelection,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { pool } = useContext(PoolContext);
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
    const { showOrderPulseAnimation } = useContext(TradeTableContext);

    const dispatch = useAppDispatch();
    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const {
        tokenA,
        tokenB,
        isTokenAPrimary,
        isTokenAPrimaryRange,
        primaryQuantity,
        limitTickCopied,
        shouldLimitDirectionReverse,
        isDenomBase,
    } = useAppSelector((state) => state.tradeData);

    const isSellTokenBase = pool?.baseToken.tokenAddr === tokenA.address;

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;

    const reverseTokens = (): void => {
        if (!location.pathname.includes('limitTick')) {
            dispatch(setLimitTick(undefined));
            dispatch(setPoolPriceNonDisplay(0));
        }

        if (!limitTickCopied) {
            linkGenLimit.navigate({
                chain: chainId,
                tokenA: tokenB.address,
                tokenB: tokenA.address,
            });
        }
        dispatch(setIsTokenAPrimary(!isTokenAPrimary));
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryRange));
    };

    useEffect(() => {
        if (shouldLimitDirectionReverse) {
            reverseTokens();
            dispatch(setShouldLimitDirectionReverse(false));
        }
    }, [shouldLimitDirectionReverse]);

    useEffect(() => {
        isTokenAPrimary
            ? setTokenAInputQty(primaryQuantity)
            : setTokenBInputQty(primaryQuantity);
    }, [tokenA.address, tokenB.address]);

    useEffect(() => {
        if (!shouldLimitDirectionReverse) {
            isTokenAPrimary
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    }, [limitTickDisplayPrice]);

    useEffect(() => {
        handleLimitButtonMessage(parseFloat(tokenAInputQty));
    }, [isWithdrawFromDexChecked]);

    const handleTokenAChangeEvent = (value?: string) => {
        let rawTokenBQty = 0;
        if (value !== undefined) {
            const inputStr = formatTokenInput(value, tokenA);
            const inputNum = parseFloat(inputStr);

            // set token input quantity to be unparsed input
            setTokenAInputQty(value);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(inputStr));

            if (!isDenomBase) {
                rawTokenBQty = isSellTokenBase
                    ? (1 / limitTickDisplayPrice) * inputNum
                    : limitTickDisplayPrice * inputNum;
            } else {
                rawTokenBQty = !isSellTokenBase
                    ? (1 / limitTickDisplayPrice) * inputNum
                    : limitTickDisplayPrice * inputNum;
            }
            handleLimitButtonMessage(inputNum);
        } else {
            if (!isDenomBase) {
                rawTokenBQty = isSellTokenBase
                    ? (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity)
                    : limitTickDisplayPrice * parseFloat(primaryQuantity);
            } else {
                rawTokenBQty = !isSellTokenBase
                    ? (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity)
                    : limitTickDisplayPrice * parseFloat(primaryQuantity);
            }
            handleLimitButtonMessage(parseFloat(tokenAInputQty));
        }

        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? rawTokenBQty.toPrecision(3)
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        setTokenBInputQty(truncatedTokenBQty);
    };

    const handleTokenBChangeEvent = (value?: string) => {
        let rawTokenAQty = 0;
        if (value !== undefined) {
            const inputStr = formatTokenInput(value, tokenA);
            const inputNum = parseFloat(inputStr);

            // set token input quantity to be unparsed input
            setTokenBInputQty(value);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(inputStr));

            if (!isDenomBase) {
                rawTokenAQty = isSellTokenBase
                    ? limitTickDisplayPrice * inputNum
                    : (1 / limitTickDisplayPrice) * inputNum;
            } else {
                rawTokenAQty = !isSellTokenBase
                    ? limitTickDisplayPrice * inputNum
                    : (1 / limitTickDisplayPrice) * inputNum;
            }

            handleLimitButtonMessage(rawTokenAQty);
        } else {
            if (!isDenomBase) {
                rawTokenAQty = isSellTokenBase
                    ? limitTickDisplayPrice * parseFloat(primaryQuantity)
                    : // ? limitTickDisplayPrice * parseFloat(tokenBQtyLocal)
                      (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity);
            } else {
                rawTokenAQty = !isSellTokenBase
                    ? limitTickDisplayPrice * parseFloat(primaryQuantity)
                    : (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity);
            }

            handleLimitButtonMessage(rawTokenAQty);
        }
        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 2
                ? rawTokenAQty.toPrecision(3)
                : truncateDecimals(rawTokenAQty, 2)
            : '';

        setTokenAInputQty(truncatedTokenAQty);
    };

    return (
        <section className={styles.token_input_container}>
            <TokenInput
                fieldId='limit_sell'
                tokenAorB='A'
                token={tokenA}
                tokenInput={tokenAInputQty}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={tokenA.address === ZERO_ADDRESS}
                isDexSelected={isWithdrawFromDexChecked}
                showPulseAnimation={showOrderPulseAnimation}
                handleTokenInputEvent={handleTokenAChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenAInputQty(formatTokenInput(val, tokenA, isMax));
                }}
                showWallet={isUserConnected}
            />
            <div className={`${styles.operation_container}`}>
                <IconWithTooltip title='Reverse tokens' placement='left'>
                    <TokensArrow
                        onClick={() => {
                            reverseTokens();
                        }}
                    />
                </IconWithTooltip>
            </div>
            <TokenInput
                fieldId='limit_buy'
                tokenAorB='B'
                token={tokenB}
                tokenInput={tokenBInputQty}
                isTokenEth={tokenB.address === ZERO_ADDRESS}
                isDexSelected={isSaveAsDexSurplusChecked}
                showPulseAnimation={showOrderPulseAnimation}
                handleTokenInputEvent={handleTokenBChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('B')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenBInputQty(formatTokenInput(val, tokenB, isMax));
                }}
            />
        </section>
    );
}

export default memo(LimitTokenInput);

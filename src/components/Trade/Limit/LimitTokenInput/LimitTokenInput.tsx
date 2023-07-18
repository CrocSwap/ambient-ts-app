import { Dispatch, memo, SetStateAction, useContext, useEffect } from 'react';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    setIsTokenAPrimary,
    setLimitTick,
    setPoolPriceNonDisplay,
    setPrimaryQuantity,
    setShouldLimitDirectionReverse,
} from '../../../../utils/state/tradeDataSlice';
import truncateDecimals from '../../../../utils/data/truncateDecimals';
import styles from '../../../Global/TokenInput/TokenInput.module.css';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { ZERO_ADDRESS } from '../../../../constants';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import TokenInput from '../../../Global/TokenInput/TokenInput';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

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

    const dispatch = useAppDispatch();

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

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const tradeData = useAppSelector((state) => state.tradeData);
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);

    const isTokenAPrimary = tradeData.isTokenAPrimary;
    const isSellTokenBase = pool?.baseToken.tokenAddr === tokenA.address;

    const tokenABalance = isSellTokenBase
        ? baseTokenBalance
        : quoteTokenBalance;
    const tokenADexBalance = isSellTokenBase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const limitTickCopied = tradeData.limitTickCopied;

    const reverseTokens = (): void => {
        if (!location.pathname.includes('limitTick')) {
            dispatch(setLimitTick(undefined));
            dispatch(setPoolPriceNonDisplay(0));
        }

        dispatch(setIsTokenAPrimary(!isTokenAPrimary));
        if (!limitTickCopied) {
            linkGenLimit.navigate({
                chain: chainId,
                tokenA: tradeData.tokenB.address,
                tokenB: tradeData.tokenA.address,
            });
        }
        if (!isTokenAPrimary) {
            setTokenAInputQty(tradeData.primaryQuantity);
        } else {
            setTokenBInputQty(tradeData.primaryQuantity);
        }
        dispatch(setIsTokenAPrimary(!isTokenAPrimary));
    };

    useEffect(() => {
        if (tradeData.shouldLimitDirectionReverse) {
            reverseTokens();
            dispatch(setShouldLimitDirectionReverse(false));
        }
    }, [tradeData.shouldLimitDirectionReverse]);

    useEffect(() => {
        isTokenAPrimary ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
    }, [limitTickDisplayPrice]);

    useEffect(() => {
        handleLimitButtonMessage(parseFloat(tokenAInputQty));
    }, [isWithdrawFromDexChecked]);

    const parseTokenInput = (value: string, token: TokenIF) => {
        const inputStr = value.replaceAll(',', '');
        const inputNum = parseFloat(inputStr);
        const truncatedInputStr = getFormattedNumber({
            value: inputNum,
            isToken: true,
            maxFracDigits: token.decimals,
            nullDisplay: '',
        });
        return truncatedInputStr;
    };

    const handleTokenAChangeEvent = (value?: string) => {
        let rawTokenBQty = 0;
        if (value !== undefined) {
            const inputStr = parseTokenInput(value, tokenA);
            const inputNum = parseFloat(inputStr);

            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(inputStr));

            if (!tradeData.isDenomBase) {
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
            const inputStr = parseTokenInput(value, tokenA);
            const inputNum = parseFloat(inputStr);

            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(inputStr));

            if (!tradeData.isDenomBase) {
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
                parseTokenInput={(val: string) => {
                    setTokenAInputQty(parseTokenInput(val, tokenA));
                }}
                showWallet={isUserConnected}
            />
            <div
                className={`${styles.operation_container}`}
                onClick={() => {
                    reverseTokens();
                }}
            >
                <IconWithTooltip title='Reverse tokens' placement='left'>
                    <TokensArrow />
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
                parseTokenInput={(val: string) => {
                    setTokenBInputQty(parseTokenInput(val, tokenB));
                }}
            />
        </section>
    );
}

export default memo(LimitTokenInput);

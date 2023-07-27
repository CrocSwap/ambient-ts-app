import { Dispatch, SetStateAction, useContext, useEffect, memo } from 'react';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import { ZERO_ADDRESS } from '../../../../constants';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import { calculateSecondaryDepositQty } from '../../../../utils/functions/calculateSecondaryDepositQty';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import {
    setPrimaryQuantityRange,
    setIsTokenAPrimaryRange,
    setRangeTicksCopied,
} from '../../../../utils/state/tradeDataSlice';
import TokenInput from '../../../Global/TokenInput/TokenInput';
import styles from '../../../Global/TokenInput/TokenInput.module.css';
import tokenArrow from '../../../../assets/images/icons/plus.svg';
import { formatTokenInput } from '../../../../utils/numbers';

interface propsIF {
    tokenAInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    tokenBInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    isAmbient: boolean;
    depositSkew: number;
    isOutOfRange: boolean;
    isRangeSpanBelowCurrentPrice: boolean;
    isWithdrawTokenAFromDexChecked: boolean;
    isWithdrawTokenBFromDexChecked: boolean;
    handleRangeButtonMessage: (
        token: TokenIF,
        tokenAmount: string,
        isWithdrawFromDexChecked: boolean,
        availableBalance: string,
        availableDexBalance: string,
    ) => void;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
}

function RangeTokenInput(props: propsIF) {
    const {
        tokenAInputQty: { value: tokenAInputQty, set: setTokenAInputQty },
        tokenBInputQty: { value: tokenBInputQty, set: setTokenBInputQty },
        isAmbient,
        depositSkew,
        isOutOfRange,
        isRangeSpanBelowCurrentPrice,
        isWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        handleRangeButtonMessage,
        toggleDexSelection,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { isPoolInitialized } = useContext(PoolContext);
    const {
        baseToken: {
            address: baseTokenAddress,
            balance: baseTokenBalance,
            dexBalance: baseTokenDexBalance,
        },
        quoteToken: {
            balance: quoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
        },
    } = useContext(TradeTokenContext);
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const dispatch = useAppDispatch();
    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const {
        tokenA,
        tokenB,
        isTokenAPrimaryRange,
        poolPriceNonDisplay,
        rangeTicksCopied,
    } = useAppSelector((state) => state.tradeData);

    const isTokenABase = tokenA.address === baseTokenAddress;
    const isTokenAEth = tokenA.address === ZERO_ADDRESS;
    const isTokenBEth = tokenB.address === ZERO_ADDRESS;

    const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isTokenABase ? quoteTokenBalance : baseTokenBalance;
    const tokenADexBalance = isTokenABase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;
    const tokenBDexBalance = isTokenABase
        ? quoteTokenDexBalance
        : baseTokenDexBalance;

    useEffect(() => {
        if (isPoolInitialized) {
            updateTokenQty();
        }
    }, [depositSkew, tokenA.address]);

    useEffect(() => {
        handleRangeButtonMessage(
            tokenA,
            tokenAInputQty,
            isWithdrawTokenAFromDexChecked,
            tokenABalance,
            tokenADexBalance,
        );
        handleRangeButtonMessage(
            tokenB,
            tokenBInputQty,
            isWithdrawTokenBFromDexChecked,
            tokenBBalance,
            tokenBDexBalance,
        );
    }, [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked]);

    const resetTokenQuantities = () => {
        setTokenAInputQty('');
        setTokenBInputQty('');
        dispatch(setPrimaryQuantityRange(''));
    };

    const setTokenQtyValue = (inputValue: string, tokenAorB: 'A' | 'B') => {
        if (poolPriceNonDisplay === undefined) return;

        const qtyToken = calculateSecondaryDepositQty(
            poolPriceNonDisplay,
            tokenA.decimals,
            tokenB.decimals,
            inputValue,
            tokenAorB !== 'A',
            isTokenABase,
            isAmbient,
            depositSkew,
        );

        const truncatedTokenQty = qtyToken
            ? getFormattedNumber({
                  value: qtyToken,
                  isInput: true,
                  zeroDisplay: '0',
                  nullDisplay: '',
              })
            : '';

        if (tokenAorB === 'A') {
            setTokenAInputQty(truncatedTokenQty);
            handleRangeButtonMessage(
                tokenA,
                truncatedTokenQty,
                isWithdrawTokenAFromDexChecked,
                tokenABalance,
                tokenADexBalance,
            );
        } else {
            setTokenBInputQty(truncatedTokenQty);
            handleRangeButtonMessage(
                tokenB,
                truncatedTokenQty,
                isWithdrawTokenBFromDexChecked,
                tokenBBalance,
                tokenBDexBalance,
            );
        }
    };

    const reverseTokens = (): void => {
        resetTokenQuantities();
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryRange));
        if (!rangeTicksCopied) {
            linkGenPool.navigate({
                chain: chainId,
                tokenA: tokenB.address,
                tokenB: tokenA.address,
            });
        }
        if (rangeTicksCopied) dispatch(setRangeTicksCopied(false));
    };

    const handleTokenAChangeEvent = (value: string) => {
        const inputStr = formatTokenInput(value, tokenA);

        dispatch(setIsTokenAPrimaryRange(true));
        dispatch(setPrimaryQuantityRange(inputStr));
        setTokenQtyValue(value, 'B');
    };

    const handleTokenBChangeEvent = (value: string) => {
        const inputStr = formatTokenInput(value, tokenB);

        dispatch(setIsTokenAPrimaryRange(false));
        dispatch(setPrimaryQuantityRange(inputStr));
        setTokenQtyValue(value, 'A');
    };

    const updateTokenQty = () => {
        if (!isOutOfRange) {
            isTokenAPrimaryRange
                ? setTokenQtyValue(tokenAInputQty, 'B')
                : setTokenQtyValue(tokenBInputQty, 'A');
        } else {
            if (
                (isRangeSpanBelowCurrentPrice && isTokenABase) ||
                (!isRangeSpanBelowCurrentPrice && !isTokenABase)
            ) {
                !!tokenAInputQty && setTokenQtyValue(tokenAInputQty, 'B');
            } else {
                !!tokenBInputQty && setTokenQtyValue(tokenBInputQty, 'A');
            }
        }
    };

    return (
        <section className={styles.token_input_container}>
            <TokenInput
                fieldId='range_A'
                tokenAorB='A'
                token={tokenA}
                tokenInput={tokenAInputQty}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={isTokenAEth}
                isDexSelected={isWithdrawTokenAFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenAChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                parseTokenInput={(val: string) => {
                    setTokenAInputQty(formatTokenInput(val, tokenA));
                }}
                showWallet={isUserConnected}
            />
            <div className={styles.operation_container}>
                <img
                    className={styles.inactive}
                    src={tokenArrow}
                    height={28}
                    alt='plus sign'
                />
            </div>
            <TokenInput
                fieldId='range_B'
                // for withdraw tooltips
                tokenAorB='A'
                token={tokenB}
                tokenInput={tokenBInputQty}
                tokenBalance={tokenBBalance}
                tokenDexBalance={tokenBDexBalance}
                isTokenEth={isTokenBEth}
                isDexSelected={isWithdrawTokenBFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenBChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('B')}
                parseTokenInput={(val: string) => {
                    setTokenBInputQty(formatTokenInput(val, tokenB));
                }}
                showWallet={isUserConnected}
            />
        </section>
    );
}

export default memo(RangeTokenInput);

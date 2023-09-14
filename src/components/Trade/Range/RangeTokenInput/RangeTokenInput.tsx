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
    poolParamsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import {
    setPrimaryQuantityRange,
    setIsTokenAPrimaryRange,
    setRangeTicksCopied,
    setIsTokenAPrimary,
} from '../../../../utils/state/tradeDataSlice';
import TokenInput from '../../../Global/TokenInput/TokenInput';
import tokenArrow from '../../../../assets/images/icons/plus.svg';
import { formatTokenInput } from '../../../../utils/numbers';
import { FlexContainer, Text } from '../../../../styled/Common';
import { InputDisabledText } from '../../../../styled/Components/TradeModules';

interface propsIF {
    tokenAInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    tokenBInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    isAmbient: boolean;
    depositSkew: number;
    isOutOfRange: boolean;
    isWithdrawFromDexChecked: { tokenA: boolean; tokenB: boolean };
    isInputDisabled: { tokenA: boolean; tokenB: boolean };
    handleButtonMessage: {
        tokenA: (tokenAmount: string) => void;
        tokenB: (tokenAmount: string) => void;
    };
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
}

function RangeTokenInput(props: propsIF) {
    const {
        tokenAInputQty: { value: tokenAInputQty, set: setTokenAInputQty },
        tokenBInputQty: { value: tokenBInputQty, set: setTokenBInputQty },
        isAmbient,
        depositSkew,
        isOutOfRange,
        isWithdrawFromDexChecked: {
            tokenA: isWithdrawTokenAFromDexChecked,
            tokenB: isWithdrawTokenBFromDexChecked,
        },
        isInputDisabled: {
            tokenA: isTokenAInputDisabled,
            tokenB: isTokenBInputDisabled,
        },
        handleButtonMessage: {
            tokenA: handleTokenAButtonMessage,
            tokenB: handleTokenBButtonMessage,
        },
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
        isTokenAPrimary,
        isTokenAPrimaryRange,
        poolPriceNonDisplay,
        rangeTicksCopied,
        advancedLowTick,
        advancedHighTick,
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
    }, [isPoolInitialized, depositSkew, tokenA.address]);

    useEffect(() => {
        handleTokenAButtonMessage(tokenAInputQty);
        handleTokenBButtonMessage(tokenBInputQty);
    }, [isWithdrawTokenAFromDexChecked, isWithdrawTokenBFromDexChecked]);

    const resetTokenQuantities = () => {
        setTokenAInputQty('');
        setTokenBInputQty('');
        dispatch(setPrimaryQuantityRange(''));
    };

    const setTokenQtyValue = (inputValue: string, primaryToken: 'A' | 'B') => {
        if (poolPriceNonDisplay === undefined) return;

        const qtyToken = calculateSecondaryDepositQty(
            poolPriceNonDisplay,
            tokenA.decimals,
            tokenB.decimals,
            inputValue,
            primaryToken === 'A',
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

        if (primaryToken === 'A') {
            setTokenAInputQty(inputValue);
            setTokenBInputQty(truncatedTokenQty);
        } else {
            setTokenAInputQty(truncatedTokenQty);
            setTokenBInputQty(inputValue);
        }

        handleTokenAButtonMessage(
            primaryToken === 'A' ? inputValue : truncatedTokenQty,
        );
        handleTokenBButtonMessage(
            primaryToken === 'A' ? truncatedTokenQty : inputValue,
        );
    };

    const reverseTokens = (): void => {
        resetTokenQuantities();
        dispatch(setIsTokenAPrimaryRange(!isTokenAPrimaryRange));
        dispatch(setIsTokenAPrimary(!isTokenAPrimary));
        if (!rangeTicksCopied) {
            // URL params for link to pool page
            const poolLinkParams: poolParamsIF = {
                chain: chainId,
                tokenA: tokenB.address,
                tokenB: tokenA.address,
                lowTick: advancedHighTick,
                highTick: advancedLowTick,
            };
            // navigate user to pool page with URL params defined above
            linkGenPool.navigate(poolLinkParams);
        }
        if (rangeTicksCopied) dispatch(setRangeTicksCopied(false));
    };

    const handleTokenAChangeEvent = (value: string) => {
        const inputStr = formatTokenInput(value, tokenA);

        dispatch(setIsTokenAPrimaryRange(true));
        dispatch(setPrimaryQuantityRange(inputStr));
        setTokenQtyValue(value, 'A');
    };

    const handleTokenBChangeEvent = (value: string) => {
        const inputStr = formatTokenInput(value, tokenB);

        dispatch(setIsTokenAPrimaryRange(false));
        dispatch(setPrimaryQuantityRange(inputStr));
        setTokenQtyValue(value, 'B');
    };

    const updateTokenQty = () => {
        if (!isOutOfRange) {
            isTokenAPrimaryRange
                ? setTokenQtyValue(tokenAInputQty, 'A')
                : setTokenQtyValue(tokenBInputQty, 'B');
        }
    };

    const disabledContent = (
        <InputDisabledText
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            fullHeight
            fullWidth
        >
            The market is outside your specified range.
            <Text color='accent1'>Single-asset deposit only.</Text>
        </InputDisabledText>
    );

    return (
        <FlexContainer flexDirection='column' gap={8}>
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
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenAInputQty(formatTokenInput(val, tokenA, isMax));
                }}
                showWallet={isUserConnected}
                disabledContent={
                    isTokenAInputDisabled ? disabledContent : undefined
                }
            />
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
                padding='0 0 8px 0'
            >
                <img
                    style={{ cursor: 'default !important' }}
                    src={tokenArrow}
                    height={28}
                    alt='plus sign'
                />
            </FlexContainer>
            <TokenInput
                fieldId='range_B'
                tokenAorB='B'
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
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenBInputQty(formatTokenInput(val, tokenB, isMax));
                }}
                showWallet={isUserConnected}
                disabledContent={
                    isTokenBInputDisabled ? disabledContent : undefined
                }
                isWithdraw
            />
        </FlexContainer>
    );
}

export default memo(RangeTokenInput);

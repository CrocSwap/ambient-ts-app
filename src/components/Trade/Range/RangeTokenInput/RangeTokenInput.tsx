import { Dispatch, SetStateAction, useContext, useEffect, memo } from 'react';
import {
    getFormattedNumber,
    calculateSecondaryDepositQty,
} from '../../../../ambient-utils/dataLayer';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import {
    linkGenMethodsIF,
    poolParamsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import TokenInputWithWalletBalance from '../../../Form/TokenInputWithWalletBalance';
import { formatTokenInput } from '../../../../utils/numbers';
import { FlexContainer, Text } from '../../../../styled/Common';
import { InputDisabledText } from '../../../../styled/Components/TradeModules';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { PoolContext } from '../../../../contexts/PoolContext';

interface propsIF {
    hidePlus?: boolean;
    tokenAInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    tokenBInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    isAmbient: boolean;
    depositSkew: number;
    poolPriceNonDisplay: number;
    isOutOfRange: boolean;
    isWithdrawFromDexChecked: { tokenA: boolean; tokenB: boolean };
    isInputDisabled: { tokenA: boolean; tokenB: boolean };
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
    reverseTokens?: () => void;
    isMintLiqEnabled?: boolean;
    isInitPage?: boolean;
    amountToReduceNativeTokenQty: number;
}

function RangeTokenInput(props: propsIF) {
    const {
        tokenAInputQty: { value: tokenAInputQty, set: setTokenAInputQty },
        tokenBInputQty: { value: tokenBInputQty, set: setTokenBInputQty },
        isAmbient,
        depositSkew,
        poolPriceNonDisplay,
        isOutOfRange,
        isWithdrawFromDexChecked: {
            tokenA: isWithdrawTokenAFromDexChecked,
            tokenB: isWithdrawTokenBFromDexChecked,
        },
        isInputDisabled: {
            tokenA: isTokenAInputDisabled,
            tokenB: isTokenBInputDisabled,
        },
        toggleDexSelection,
        hidePlus,
        reverseTokens,
        isMintLiqEnabled = true,
        isInitPage,
        amountToReduceNativeTokenQty,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isTokenABase,
        isTokenAEth,
        isTokenBEth,
    } = useContext(TradeTokenContext);
    const { showRangePulseAnimation } = useContext(TradeTableContext);
    const { poolData } = useContext(PoolContext);
    const { rangeTicksCopied, setRangeTicksCopied } = useContext(RangeContext);
    // hook to generate navigation actions with pre-loaded path
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const { isUserConnected } = useContext(UserDataContext);

    const {
        tokenA,
        tokenB,
        isTokenAPrimary,
        setIsTokenAPrimary,
        setPrimaryQuantity,
    } = useContext(TradeDataContext);
    useEffect(() => {
        if (poolPriceNonDisplay) {
            updateTokenQty();
        }
    }, [poolPriceNonDisplay, depositSkew, tokenA.address]);

    const resetTokenQuantities = () => {
        setTokenAInputQty('');
        setTokenBInputQty('');
        setPrimaryQuantity('');
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
    };

    const reverseTokensLocal = reverseTokens
        ? reverseTokens
        : (): void => {
              resetTokenQuantities();
              setIsTokenAPrimary(!isTokenAPrimary);
              setIsTokenAPrimary(!isTokenAPrimary);
              if (!rangeTicksCopied && !isInitPage) {
                  // URL params for link to pool page
                  const poolLinkParams: poolParamsIF = {
                      chain: chainId,
                      tokenA: tokenB.address,
                      tokenB: tokenA.address,
                  };
                  // navigate user to pool page with URL params defined above
                  linkGenPool.navigate(poolLinkParams);
              }
              if (rangeTicksCopied) setRangeTicksCopied(false);
          };

    const handleTokenAChangeEvent = (value: string) => {
        setIsTokenAPrimary(true);
        setPrimaryQuantity(value);
        setTokenQtyValue(value, 'A');
    };

    const handleTokenBChangeEvent = (value: string) => {
        setIsTokenAPrimary(false);
        setPrimaryQuantity(value);
        setTokenQtyValue(value, 'B');
    };

    const updateTokenQty = () => {
        if (!isOutOfRange) {
            isTokenAPrimary
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

    const usdValueTokenA = isTokenABase
        ? poolData.basePrice
        : poolData.quotePrice;
    const usdValueTokenB = isTokenABase
        ? poolData.quotePrice
        : poolData.basePrice;

    return (
        <FlexContainer flexDirection='column' gap={8}>
            <TokenInputWithWalletBalance
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
                reverseTokens={reverseTokensLocal}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenAInputQty(formatTokenInput(val, tokenA, isMax));
                }}
                showWallet={isUserConnected}
                disabledContent={
                    isTokenAInputDisabled && isMintLiqEnabled
                        ? disabledContent
                        : undefined
                }
                amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
                isInitPage={isInitPage}
                usdValue={usdValueTokenA}
            />
            {!hidePlus && (
                <FlexContainer
                    fullWidth
                    justifyContent='center'
                    alignItems='center'
                >
                    <svg
                        width='28'
                        height='28'
                        viewBox='0 0 28 28'
                        fill='#000000'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <g
                            clipPath='url(#clip0_4245_78460)'
                            filter='url(#filter0_d_4245_78460)'
                        >
                            <path
                                d='M14 0V20'
                                stroke='var(--accent1)'
                                strokeWidth='3'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                            <path
                                d='M4 10H24'
                                stroke='var(--accent1)'
                                strokeWidth='3'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </g>
                        <defs>
                            <filter
                                id='filter0_d_4245_78460'
                                x='0'
                                y='0'
                                width='28'
                                height='28'
                                filterUnits='userSpaceOnUse'
                                colorInterpolationFilters='sRGB'
                            >
                                <feFlood
                                    floodOpacity='0'
                                    result='BackgroundImageFix'
                                />
                                <feColorMatrix
                                    in='SourceAlpha'
                                    type='matrix'
                                    values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                                    result='hardAlpha'
                                />
                                <feOffset dy='4' />
                                <feGaussianBlur stdDeviation='2' />
                                <feComposite in2='hardAlpha' operator='out' />
                                <feColorMatrix
                                    type='matrix'
                                    values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'
                                />
                                <feBlend
                                    mode='normal'
                                    in2='BackgroundImageFix'
                                    result='effect1_dropShadow_4245_78460'
                                />
                                <feBlend
                                    mode='normal'
                                    in='SourceGraphic'
                                    in2='effect1_dropShadow_4245_78460'
                                    result='shape'
                                />
                            </filter>
                            <clipPath id='clip0_4245_78460'>
                                <rect
                                    width='20'
                                    height='20'
                                    fill='#000000'
                                    transform='translate(4)'
                                />
                            </clipPath>
                        </defs>
                    </svg>
                </FlexContainer>
            )}
            <TokenInputWithWalletBalance
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
                reverseTokens={reverseTokensLocal}
                handleToggleDexSelection={() => toggleDexSelection('B')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenBInputQty(formatTokenInput(val, tokenB, isMax));
                }}
                showWallet={isUserConnected}
                disabledContent={
                    isTokenBInputDisabled && isMintLiqEnabled
                        ? disabledContent
                        : undefined
                }
                amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
                isInitPage={isInitPage}
                isWithdraw
                usdValue={usdValueTokenB}
            />
        </FlexContainer>
    );
}

export default memo(RangeTokenInput);

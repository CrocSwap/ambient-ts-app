import { fromDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, memo, SetStateAction, useContext, useEffect } from 'react';
import { ZERO_ADDRESS } from '../../../../ambient-utils/constants';
import {
    precisionOfInput,
    truncateDecimals,
} from '../../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../../contexts';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../../contexts/TradeTokenContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    limitParamsIF,
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { formatTokenInput } from '../../../../utils/numbers';
import TokenInputWithWalletBalance from '../../../Form/TokenInputWithWalletBalance';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import TokensArrow from '../../../Global/TokensArrow/TokensArrow';

interface propsIF {
    tokenAInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    tokenBInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    limitTickDisplayPrice: number;
    isWithdrawFromDexChecked: boolean;
    isSaveAsDexSurplusChecked: boolean;
    handleLimitButtonMessage: (val: bigint) => void;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
    amountToReduceNativeTokenQty: number;
    usdValueTokenA: number | undefined;
    usdValueTokenB: number | undefined;
    percentDiffUsdValue: number | undefined;
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
        amountToReduceNativeTokenQty,
        usdValueTokenA,
        usdValueTokenB,
        percentDiffUsdValue,
    } = props;

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
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

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const { isUserConnected } = useContext(UserDataContext);
    const { isUserOnline } = useContext(AppStateContext);

    const {
        tokenA,
        tokenB,
        isTokenAPrimary,
        isDenomBase,
        setIsTokenAPrimary,
        setLimitTick,
        primaryQuantity,
        setPrimaryQuantity,
        isTokenABase,
    } = useContext(TradeDataContext);

    const tokenABalance = isTokenABase ? baseTokenBalance : quoteTokenBalance;
    const tokenADexBalance = isTokenABase
        ? baseTokenDexBalance
        : quoteTokenDexBalance;

    const reverseTokens = (): void => {
        setLimitTick(undefined);

        const limitLinkParams: limitParamsIF = {
            chain: chainId,
            tokenA: tokenB.address,
            tokenB: tokenA.address,
        };
        // navigate user to limit page with URL params defined above
        linkGenLimit.navigate(limitLinkParams);
        setIsTokenAPrimary(!isTokenAPrimary);
    };

    useEffect(() => {
        isTokenAPrimary
            ? setTokenAInputQty(primaryQuantity)
            : setTokenBInputQty(primaryQuantity);
    }, [tokenA.address, tokenB.address]);

    useEffect(() => {
        if (isUserOnline) {
            isTokenAPrimary
                ? handleTokenAChangeEvent()
                : handleTokenBChangeEvent();
        }
    }, [limitTickDisplayPrice, isUserOnline]);

    useEffect(() => {
        handleLimitButtonMessage(
            fromDisplayQty(tokenAInputQty || '0', tokenA.decimals),
        );
    }, [isWithdrawFromDexChecked]);

    const handleTokenAChangeEvent = (value?: string) => {
        let rawTokenBQty = 0;
        if (value !== undefined) {
            // const inputStr = formatTokenInput(value, tokenA);
            // value = value || '0.00';
            const inputNum = parseFloat(value);
            const inputBigNum = fromDisplayQty(value || '0', tokenA.decimals);

            // set token input quantity to be unparsed input
            setTokenAInputQty(value);
            setIsTokenAPrimary(true);
            setPrimaryQuantity(value);

            if (!isDenomBase) {
                rawTokenBQty = isTokenABase
                    ? (1 / limitTickDisplayPrice) * inputNum
                    : limitTickDisplayPrice * inputNum;
            } else {
                rawTokenBQty = !isTokenABase
                    ? (1 / limitTickDisplayPrice) * inputNum
                    : limitTickDisplayPrice * inputNum;
            }
            handleLimitButtonMessage(inputBigNum);
        } else {
            if (!isDenomBase) {
                rawTokenBQty = isTokenABase
                    ? (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity)
                    : limitTickDisplayPrice * parseFloat(primaryQuantity);
            } else {
                rawTokenBQty = !isTokenABase
                    ? (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity)
                    : limitTickDisplayPrice * parseFloat(primaryQuantity);
            }
            handleLimitButtonMessage(
                fromDisplayQty(tokenAInputQty || '0', tokenA.decimals),
            );
        }

        let precisionForTruncation = 6;

        const fixedTokenBQty = parseFloat(
            rawTokenBQty.toFixed(tokenB.decimals),
        );

        const precisionOfTruncatedTokenBQty = precisionOfInput(
            fixedTokenBQty.toPrecision(precisionForTruncation),
        );

        // find the largest precision that doesn't exceed the token's decimal places
        while (
            precisionOfTruncatedTokenBQty > tokenB.decimals &&
            precisionForTruncation > 1
        ) {
            precisionForTruncation--;
        }

        const truncatedTokenBQtyIsZero =
            fixedTokenBQty.toPrecision(precisionForTruncation) === '0.00000';

        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 2
                ? truncatedTokenBQtyIsZero
                    ? '0'
                    : fixedTokenBQty
                          .toPrecision(precisionForTruncation)
                          .replace(/\.?0+$/, '') // Remove trailing zeros
                : truncateDecimals(rawTokenBQty, 2)
            : '';

        // prevent momentary display of 'Infinity' for limit price on initial load
        limitTickDisplayPrice && setTokenBInputQty(truncatedTokenBQty);
    };

    const handleTokenBChangeEvent = (value?: string) => {
        let rawTokenAQty = 0;
        if (value !== undefined) {
            const inputNum = parseFloat(value);

            // set token input quantity to be unparsed input
            setTokenBInputQty(value);
            setIsTokenAPrimary(false);
            setPrimaryQuantity(value);

            if (value === '') {
                setTokenAInputQty('');
                return;
            }

            if (!isDenomBase) {
                rawTokenAQty = isTokenABase
                    ? limitTickDisplayPrice * inputNum
                    : (1 / limitTickDisplayPrice) * inputNum;
            } else {
                rawTokenAQty = !isTokenABase
                    ? limitTickDisplayPrice * inputNum
                    : (1 / limitTickDisplayPrice) * inputNum;
            }
            if (rawTokenAQty === Infinity || isNaN(rawTokenAQty)) return;
            const formattedRawTokenAQty = formatTokenInput(
                rawTokenAQty.toString(),
                tokenA,
            );
            handleLimitButtonMessage(
                fromDisplayQty(formattedRawTokenAQty, tokenA.decimals),
            );
        } else {
            if (primaryQuantity === '') {
                setTokenAInputQty('');
                return;
            }
            if (!isDenomBase) {
                rawTokenAQty = isTokenABase
                    ? limitTickDisplayPrice * parseFloat(primaryQuantity)
                    : (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity);
            } else {
                rawTokenAQty = !isTokenABase
                    ? limitTickDisplayPrice * parseFloat(primaryQuantity)
                    : (1 / limitTickDisplayPrice) * parseFloat(primaryQuantity);
            }
            if (rawTokenAQty === Infinity || isNaN(rawTokenAQty)) return;
            const formattedRawTokenAQty = formatTokenInput(
                rawTokenAQty.toString(),
                tokenA,
            );
            handleLimitButtonMessage(
                fromDisplayQty(formattedRawTokenAQty, tokenA.decimals),
            );
        }
        let precisionForTruncation = 6;

        const fixedTokenAQty = parseFloat(
            rawTokenAQty.toFixed(tokenA.decimals),
        );

        const precisionOfTruncatedTokenAQty = precisionOfInput(
            fixedTokenAQty.toPrecision(precisionForTruncation),
        );

        // find the largest precision that doesn't exceed the token's decimal places
        while (
            precisionOfTruncatedTokenAQty > tokenA.decimals &&
            precisionForTruncation > 1
        ) {
            precisionForTruncation--;
        }

        const truncatedTokenAQtyIsZero =
            fixedTokenAQty.toPrecision(precisionForTruncation) === '0.00000';

        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 2
                ? truncatedTokenAQtyIsZero
                    ? '0'
                    : fixedTokenAQty
                          .toPrecision(precisionForTruncation)
                          .replace(/\.?0+$/, '')
                : truncateDecimals(rawTokenAQty, 2)
            : '';

        limitTickDisplayPrice && setTokenAInputQty(truncatedTokenAQty);
    };

    return (
        <FlexContainer flexDirection='column' gap={8}>
            <TokenInputWithWalletBalance
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
                amountToReduceNativeTokenQty={amountToReduceNativeTokenQty}
                usdValue={usdValueTokenA}
            />
            <FlexContainer
                fullWidth
                justifyContent='center'
                alignItems='center'
            >
                <IconWithTooltip title='Reverse tokens' placement='left'>
                    <TokensArrow
                        onClick={() => {
                            reverseTokens();
                        }}
                    />
                </IconWithTooltip>
            </FlexContainer>
            <TokenInputWithWalletBalance
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
                amountToReduceNativeTokenQty={0} // value not used for buy token
                usdValue={usdValueTokenB}
                percentDiffUsdValue={percentDiffUsdValue}
            />
        </FlexContainer>
    );
}

export default memo(LimitTokenInput);

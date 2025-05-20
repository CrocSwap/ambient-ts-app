import { useContext, useEffect, useMemo, useState } from 'react';

import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';
import { TokenPairIF } from '../../../ambient-utils/types';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { FlexContainer, Text } from '../../../styled/Common';
import { WarningBox } from '../../RangeActionModal/WarningBox/WarningBox';
import TradeConfirmationSkeleton from '../../Trade/TradeModules/TradeConfirmationSkeleton';

interface propsIF {
    initiateSwapMethod: () => Promise<void>;
    isDenomBase: boolean;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    newSwapTransactionHash: string;
    tokenPair: TokenPairIF;
    txError: Error | undefined;
    showConfirmation: boolean;
    resetConfirmation: () => void;
    slippageTolerancePercentage: number;
    effectivePrice: number;
    isTokenABase: boolean;
    sellQtyString: string;
    buyQtyString: string;
    onClose?: () => void;
    isTokenAPrimary: boolean;
    priceImpactWarning: JSX.Element | undefined;
    isSaveAsDexSurplusChecked: boolean;
    percentDiffUsdValue: number | undefined;
    crocEnv: CrocEnv | undefined;
    priceImpact: CrocImpact | undefined;
}

export default function ConfirmSwapModal(props: propsIF) {
    const {
        initiateSwapMethod,
        isDenomBase,
        baseTokenSymbol,
        quoteTokenSymbol,
        newSwapTransactionHash,
        tokenPair,
        txError,
        resetConfirmation,
        showConfirmation,
        slippageTolerancePercentage,
        effectivePrice,
        isTokenABase,
        sellQtyString,
        buyQtyString,
        onClose = () => null,
        isTokenAPrimary,
        priceImpactWarning,
        isSaveAsDexSurplusChecked,
        percentDiffUsdValue,
        crocEnv,
        priceImpact,
    } = props;

    const { lastBlockNumber } = useContext(ChainDataContext);

    const sellTokenData = tokenPair.dataTokenA;
    const buyTokenData = tokenPair.dataTokenB;

    const [isDenomBaseLocal, setIsDenomBaseLocal] = useState(isDenomBase);

    const [isWaitingForPriceChangeAckt, setIsWaitingForPriceChangeAckt] =
        useState<boolean>(false);

    // logic to prevent swap quantities updating during/after swap completion
    const [memoTokenAQty, setMemoTokenAQty] = useState<string | undefined>();
    const [memoTokenBQty, setMemoTokenBQty] = useState<string | undefined>();
    const [memoEffectivePrice, setMemoEffectivePrice] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (newSwapTransactionHash === '') {
            setMemoTokenAQty(sellQtyString);
            setMemoTokenBQty(buyQtyString);
            setMemoEffectivePrice(effectivePrice);
        }
    }, [newSwapTransactionHash, sellQtyString, buyQtyString, effectivePrice]);

    // calculate the percentage change in pool price since the confirm modal was opened
    const [initialPriceImpact, setInitialPriceImpact] = useState<
        CrocImpact | undefined
    >(priceImpact);

    useEffect(() => {
        if (!isWaitingForPriceChangeAckt) setInitialPriceImpact(priceImpact);
    }, [isWaitingForPriceChangeAckt]);

    const priceChangePercentage = useMemo(() => {
        if (!priceImpact || !initialPriceImpact) return;

        const initialPriceInBase = initialPriceImpact.finalPrice;
        const newPriceInBase = priceImpact.finalPrice;

        const changePercentage = isTokenABase
            ? ((initialPriceInBase - newPriceInBase) / initialPriceInBase) * 100
            : ((newPriceInBase - initialPriceInBase) / initialPriceInBase) *
              100;

        if (changePercentage >= 0.01) {
            setIsWaitingForPriceChangeAckt(true);
        } else {
            setIsWaitingForPriceChangeAckt(false);
        }

        return changePercentage;
    }, [priceImpact, initialPriceImpact, isTokenABase]);

    const buyTokenPriceChangeString = priceChangePercentage
        ? priceChangePercentage.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : undefined;

    const isPriceInverted =
        (isDenomBaseLocal && !isTokenABase) ||
        (!isDenomBaseLocal && isTokenABase);

    const effectivePriceWithDenom = memoEffectivePrice
        ? isPriceInverted
            ? 1 / memoEffectivePrice
            : memoEffectivePrice
        : undefined;

    const priceIncreaseComponent = (
        <WarningBox
            title='Price Updated'
            details={`The price of ${buyTokenData.symbol} has increased by
        ${buyTokenPriceChangeString}%`}
            button={
                <button
                    onClick={() => {
                        setIsWaitingForPriceChangeAckt(false);
                    }}
                >
                    Accept
                </button>
            }
        />
    );

    const transactionDetails = (
        <>
            {isTokenAPrimary ? (
                <FlexContainer
                    justifyContent='space-between'
                    alignItems='center'
                >
                    <Text fontSize='body' color='text2'>
                        Expected Output
                    </Text>
                    <Text fontSize='body' color='text2'>
                        {memoTokenBQty} {buyTokenData.symbol}
                    </Text>
                </FlexContainer>
            ) : (
                <FlexContainer
                    justifyContent='space-between'
                    alignItems='center'
                >
                    <Text fontSize='body' color='text2'>
                        Expected Input
                    </Text>
                    <Text fontSize='body' color='text2'>
                        {memoTokenAQty} {sellTokenData.symbol}
                    </Text>
                </FlexContainer>
            )}
            {
                <FlexContainer
                    justifyContent='space-between'
                    alignItems='center'
                >
                    <Text fontSize='body' color='text2'>
                        Output Destination
                    </Text>
                    <Text fontSize='body' color='text2'>
                        {isSaveAsDexSurplusChecked
                            ? 'Exchange Balance'
                            : 'Wallet'}
                    </Text>
                </FlexContainer>
            }
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Effective Conversion Rate
                </Text>
                <Text
                    fontSize='body'
                    color='text2'
                    onClick={() => {
                        setIsDenomBaseLocal(!isDenomBaseLocal);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {isDenomBaseLocal
                        ? `${getFormattedNumber({
                              value: effectivePriceWithDenom,
                          })} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${getFormattedNumber({
                              value: effectivePriceWithDenom,
                          })} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </Text>
            </FlexContainer>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Slippage Tolerance
                </Text>
                <Text fontSize='body' color='text2'>
                    {slippageTolerancePercentage}%
                </Text>
            </FlexContainer>
        </>
    );

    return (
        <TradeConfirmationSkeleton
            onClose={onClose}
            type='Swap'
            tokenA={{ token: sellTokenData, quantity: memoTokenAQty }}
            tokenB={{ token: buyTokenData, quantity: memoTokenBQty }}
            transactionDetails={transactionDetails}
            transactionHash={newSwapTransactionHash}
            txError={txError}
            showConfirmation={showConfirmation}
            statusText={
                !showConfirmation
                    ? 'Submit Swap'
                    : `Swapping ${sellQtyString} ${sellTokenData.symbol} for ${buyQtyString} ${buyTokenData.symbol}`
            }
            initiate={initiateSwapMethod}
            resetConfirmation={resetConfirmation}
            acknowledgeUpdate={
                isWaitingForPriceChangeAckt && priceIncreaseComponent
            }
            priceImpactWarning={priceImpactWarning}
            percentDiffUsdValue={percentDiffUsdValue}
        />
    );
}

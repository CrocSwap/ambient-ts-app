import { useContext } from 'react';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import TradeConfirmationSkeleton from '../../TradeModules/TradeConfirmationSkeleton';

interface propsIF {
    initiateLimitOrderMethod: () => Promise<void>;
    tokenAInputQty: string;
    tokenBInputQty: string;
    newLimitOrderTransactionHash: string;
    txError: Error | undefined;
    showConfirmation: boolean;
    resetConfirmation: () => void;
    startDisplayPrice: number | undefined;
    middleDisplayPrice: number | undefined;
    endDisplayPrice: number | undefined;
    onClose: () => void;
    limitAllowed: boolean;
    limitButtonErrorMessage: string;
    percentDiffUsdValue: number;
}

export default function ConfirmLimitModal(props: propsIF) {
    const {
        initiateLimitOrderMethod,
        newLimitOrderTransactionHash,
        txError,
        resetConfirmation,
        showConfirmation,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        tokenAInputQty,
        tokenBInputQty,
        onClose = () => null,
        limitAllowed,
        limitButtonErrorMessage,
        percentDiffUsdValue,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);

    const {
        tokenA,
        tokenB,
        isDenomBase,
        baseToken: { symbol: baseTokenSymbol },
        quoteToken: { symbol: quoteTokenSymbol },
    } = useContext(TradeDataContext);

    const displayPoolPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : (poolPriceDisplay ?? 0);

    const displayPoolPriceString = getFormattedNumber({
        value: displayPoolPriceWithDenom,
    });

    const startPriceString = startDisplayPrice
        ? getFormattedNumber({
              value: startDisplayPrice,
          })
        : '...';

    const middlePriceString = middleDisplayPrice
        ? getFormattedNumber({
              value: middleDisplayPrice,
          })
        : '...';

    const endPriceString = endDisplayPrice
        ? getFormattedNumber({
              value: endDisplayPrice,
          })
        : '...';

    const transactionDetails = (
        <>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Current Price
                </Text>
                <Text fontSize='body' color='text2'>
                    {isDenomBase
                        ? `${displayPoolPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${displayPoolPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </Text>
            </FlexContainer>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Fill Start
                </Text>
                <Text fontSize='body' color='text2'>
                    {isDenomBase
                        ? `${startPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${startPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </Text>
            </FlexContainer>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Fill Middle
                </Text>
                <Text fontSize='body' color='text2'>
                    {isDenomBase
                        ? `${middlePriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${middlePriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </Text>
            </FlexContainer>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Fill End
                </Text>
                <Text fontSize='body' color='text2'>
                    {isDenomBase
                        ? `${endPriceString} ${quoteTokenSymbol} per ${baseTokenSymbol}`
                        : `${endPriceString} ${baseTokenSymbol} per ${quoteTokenSymbol}`}
                </Text>
            </FlexContainer>
        </>
    );

    const extraNotes = (
        <Text fontSize='body' color='accent2' style={{ textAlign: 'center' }}>
            <div>
                {`A button to claim ${tokenB.symbol} will appear in your Limits tab once filled.`}
            </div>
            <div>{' '}</div>
            <div>{` ${tokenA.symbol} can be withdrawn at any time before fill completion.`}</div>
        </Text>
    );

    return (
        <TradeConfirmationSkeleton
            onClose={onClose}
            type='Limit'
            initiate={initiateLimitOrderMethod}
            tokenA={{ token: tokenA, quantity: tokenAInputQty }}
            tokenB={{ token: tokenB, quantity: tokenBInputQty }}
            transactionDetails={transactionDetails}
            extraNotes={extraNotes}
            transactionHash={newLimitOrderTransactionHash}
            txError={txError}
            statusText={
                !showConfirmation
                    ? limitAllowed
                        ? 'Submit Limit Order'
                        : limitButtonErrorMessage
                    : `Submitting Limit Order to Swap ${tokenAInputQty} ${tokenA.symbol} for ${tokenBInputQty} ${tokenB.symbol}`
            }
            showConfirmation={showConfirmation}
            resetConfirmation={resetConfirmation}
            isAllowed={limitAllowed}
            percentDiffUsdValue={percentDiffUsdValue}
        />
    );
}

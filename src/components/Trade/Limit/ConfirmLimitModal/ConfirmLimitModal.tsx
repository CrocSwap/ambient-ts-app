import { useContext } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { PoolContext } from '../../../../contexts/PoolContext';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';
import TradeConfirmationSkeleton from '../../TradeModules/TradeConfirmationSkeleton';
import { FlexContainer, Text } from '../../../../styled/Common';

interface propsIF {
    initiateLimitOrderMethod: () => Promise<void>;
    tokenAInputQty: string;
    tokenBInputQty: string;
    insideTickDisplayPrice: number;
    newLimitOrderTransactionHash: string;
    txErrorCode: string;
    showConfirmation: boolean;
    resetConfirmation: () => void;
    startDisplayPrice: number;
    middleDisplayPrice: number;
    endDisplayPrice: number;
    onClose: () => void;
}

export default function ConfirmLimitModal(props: propsIF) {
    const {
        initiateLimitOrderMethod,
        newLimitOrderTransactionHash,
        txErrorCode,
        resetConfirmation,
        showConfirmation,
        startDisplayPrice,
        middleDisplayPrice,
        endDisplayPrice,
        tokenAInputQty,
        tokenBInputQty,
        onClose = () => null,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);

    const {
        tokenA,
        tokenB,
        isDenomBase,
        baseToken: { symbol: baseTokenSymbol },
        quoteToken: { symbol: quoteTokenSymbol },
    } = useAppSelector((state) => state.tradeData);

    const displayPoolPriceWithDenom =
        isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPoolPriceString = getFormattedNumber({
        value: displayPoolPriceWithDenom,
    });

    const localeSellString = getFormattedNumber({
        value: parseFloat(tokenAInputQty),
    });
    const localeBuyString = getFormattedNumber({
        value: parseFloat(tokenBInputQty),
    });

    const startPriceString = getFormattedNumber({
        value: startDisplayPrice,
    });
    const middlePriceString = getFormattedNumber({
        value: middleDisplayPrice,
    });
    const endPriceString = getFormattedNumber({
        value: endDisplayPrice,
    });

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
            {`${tokenB.symbol} will be available for withdrawal after the limit order is filled. 
        ${tokenA.symbol} can be withdrawn at any time before fill completion.`}
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
            txErrorCode={txErrorCode}
            statusText={
                !showConfirmation
                    ? 'Submit Limit Order'
                    : `Submitting Limit Order to Swap ${localeSellString} ${tokenA.symbol} for ${localeBuyString} ${tokenB.symbol}`
            }
            showConfirmation={showConfirmation}
            resetConfirmation={resetConfirmation}
        />
    );
}

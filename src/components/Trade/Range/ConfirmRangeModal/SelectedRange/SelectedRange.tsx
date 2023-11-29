import { Dispatch, SetStateAction, memo, useContext } from 'react';
import { PoolContext } from '../../../../../contexts/PoolContext';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import { FlexContainer, Text } from '../../../../../styled/Common';
import { SelectedRangeContainer } from '../../../../../styled/Components/TradeModules';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';

interface propsIF {
    isTokenABase: boolean;
    isAmbient: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
    showOnlyFeeTier?: boolean;
    isDenomBase: boolean;
    setIsDenomBase: Dispatch<SetStateAction<boolean>>;
    initialPrice?: number;
    isInitPage?: boolean;
}
function SelectedRange(props: propsIF) {
    const {
        isDenomBase,
        setIsDenomBase,
        isTokenABase,
        isAmbient,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
        showOnlyFeeTier,
        initialPrice,
        isInitPage,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);
    const { tokenA, tokenB } = useContext(TradeDataContext);

    const reverseDisplay =
        (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const minPrice = isDenomBase
        ? pinnedMinPriceDisplayTruncatedInBase
        : pinnedMinPriceDisplayTruncatedInQuote;

    const maxPrice = isDenomBase
        ? pinnedMaxPriceDisplayTruncatedInBase
        : pinnedMaxPriceDisplayTruncatedInQuote;

    const displayPriceWithDenom =
        isInitPage && initialPrice
            ? isDenomBase
                ? initialPrice
                : 1 / initialPrice
            : isDenomBase && poolPriceDisplay
            ? 1 / poolPriceDisplay
            : poolPriceDisplay ?? 0;

    const displayPriceString = getFormattedNumber({
        value: displayPriceWithDenom,
    });

    // PRICE RANGE DISPLAY
    interface PriceRangeProps {
        title: string;
        value: number | string;
        tokens: string;
        currentToken: string;
    }

    const PriceRangeDisplay = (props: PriceRangeProps) => {
        const { title, value, tokens, currentToken } = props;
        return (
            <FlexContainer
                fullWidth
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                background='dark2'
                style={{
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                }}
                gap={isInitPage ? 10 : 4}
                padding={'8px'}
                onClick={() => {
                    setIsDenomBase(!isDenomBase);
                }}
            >
                <Text fontSize='body' color='text2'>
                    {title}
                </Text>
                <Text fontSize='header2' color='text1'>
                    {value}
                </Text>
                <Text fontSize='body' color='text2'>
                    {tokens}
                </Text>
                <Text
                    fontSize='body'
                    color='accent5'
                    style={{ textAlign: 'center' }}
                >
                    Your position will be 100% {currentToken} at this price.
                </Text>
            </FlexContainer>
        );
    };

    const selectedRangeDisplay = (
        <SelectedRangeContainer margin={isInitPage ? '0' : '8px 0 0 0'} gap={8}>
            <PriceRangeDisplay
                title='Min Price'
                value={isAmbient ? '0' : minPrice}
                tokens={
                    reverseDisplay
                        ? `${tokenB.symbol} per ${tokenA.symbol}`
                        : `${tokenA.symbol} per ${tokenB.symbol}`
                }
                currentToken={reverseDisplay ? tokenA.symbol : tokenB.symbol}
            />
            <PriceRangeDisplay
                title='Max Price'
                value={isAmbient ? '∞' : maxPrice}
                tokens={
                    reverseDisplay
                        ? `${tokenB.symbol} per ${tokenA.symbol}`
                        : `${tokenA.symbol} per ${tokenB.symbol}`
                }
                currentToken={reverseDisplay ? tokenB.symbol : tokenA.symbol}
            />
        </SelectedRangeContainer>
    );

    const extraInfoData = (
        <FlexContainer
            flexDirection='column'
            gap={8}
            padding='8px'
            margin={isInitPage ? '0' : '8px 0 0 0'}
            style={{ border: '1px solid var(--dark3)', borderRadius: '4px' }}
        >
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    {isInitPage ? 'Initial Price' : 'Current Price'}
                </Text>
                <Text
                    fontSize='body'
                    color='text2'
                    onClick={() => {
                        setIsDenomBase(!isDenomBase);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {`${displayPriceString} ${
                        reverseDisplay ? tokenB.symbol : tokenA.symbol
                    }`}
                </Text>
            </FlexContainer>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    {isInitPage ? 'Initial Fee Rate' : 'Current Fee Rate'}
                </Text>
                <Text fontSize='body' color='text2'>
                    {isInitPage ? 'Dynamic' : '0.05%'}
                </Text>
            </FlexContainer>
        </FlexContainer>
    );
    if (showOnlyFeeTier) return extraInfoData;

    return (
        <FlexContainer flexDirection='column' gap={8}>
            {selectedRangeDisplay}
            <div style={{ padding: isInitPage ? '0 4rem' : '0 1rem' }}>
                {extraInfoData}
            </div>
        </FlexContainer>
    );
}

export default memo(SelectedRange);

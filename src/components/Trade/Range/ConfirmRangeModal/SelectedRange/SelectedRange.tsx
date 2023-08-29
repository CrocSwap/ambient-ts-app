import { memo, useContext, useState } from 'react';
import { PoolContext } from '../../../../../contexts/PoolContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import { FlexContainer, Text } from '../../../../../styled/Common';
import { SelectedRangeContainer } from '../../../../../styled/Components/TradeModules';

interface propsIF {
    isTokenABase: boolean;
    isAmbient: boolean;
    pinnedMinPriceDisplayTruncatedInBase: string;
    pinnedMinPriceDisplayTruncatedInQuote: string;
    pinnedMaxPriceDisplayTruncatedInBase: string;
    pinnedMaxPriceDisplayTruncatedInQuote: string;
}
function SelectedRange(props: propsIF) {
    const {
        isTokenABase,
        isAmbient,
        pinnedMinPriceDisplayTruncatedInBase,
        pinnedMinPriceDisplayTruncatedInQuote,
        pinnedMaxPriceDisplayTruncatedInBase,
        pinnedMaxPriceDisplayTruncatedInQuote,
    } = props;

    const { poolPriceDisplay } = useContext(PoolContext);
    const { isDenomBase, tokenA, tokenB } = useAppSelector(
        (state) => state.tradeData,
    );

    const reverseDisplayDefault =
        (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const [denomInBase, setDenomInBase] = useState(isDenomBase);
    const [reverseDisplay, setReverseDisplay] = useState(reverseDisplayDefault);

    const minPrice = denomInBase
        ? pinnedMinPriceDisplayTruncatedInBase
        : pinnedMinPriceDisplayTruncatedInQuote;

    const maxPrice = denomInBase
        ? pinnedMaxPriceDisplayTruncatedInBase
        : pinnedMaxPriceDisplayTruncatedInQuote;

    const displayPriceWithDenom =
        denomInBase && poolPriceDisplay
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
                style={{ borderRadius: 'var(--border-radius)' }}
                gap={4}
                padding='8px'
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
        <SelectedRangeContainer margin='8px 0 0 0' gap={8}>
            <PriceRangeDisplay
                title='Min Price'
                value={minPrice}
                tokens={
                    reverseDisplay
                        ? `${tokenB.symbol} per ${tokenA.symbol}`
                        : `${tokenA.symbol} per ${tokenB.symbol}`
                }
                currentToken={reverseDisplay ? tokenA.symbol : tokenB.symbol}
            />
            <PriceRangeDisplay
                title='Max Price'
                value={maxPrice}
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
            margin='8px 0 0 0'
            style={{ border: '1px solid var(--dark3)', borderRadius: '4px' }}
        >
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Current Price
                </Text>
                <Text
                    fontSize='body'
                    color='text2'
                    onClick={() => {
                        setReverseDisplay(!reverseDisplay);
                        setDenomInBase(!denomInBase);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {displayPriceString}
                </Text>
            </FlexContainer>
            <FlexContainer justifyContent='space-between' alignItems='center'>
                <Text fontSize='body' color='text2'>
                    Current Fee Rate
                </Text>
                <Text fontSize='body' color='text2'>
                    0.05%
                </Text>
            </FlexContainer>
        </FlexContainer>
    );

    return (
        <FlexContainer flexDirection='column' gap={8}>
            {!isAmbient ? selectedRangeDisplay : null}
            <div style={{ padding: '0 1rem' }}>{extraInfoData}</div>
        </FlexContainer>
    );
}

export default memo(SelectedRange);

// open up flex and grid containers so that we can avoid inline styling
// be smart about paddings etc
// [].map
// create common components
// phase 1.5 - media queries and constants
// phase 2 - abstraction, creating Miyu library of comps
// phase 2.5 - standardize paddings, margins, etc.

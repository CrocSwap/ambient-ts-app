import {
    ChangeEvent,
    FocusEvent,
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useEffect,
} from 'react';
import PriceInput from '../PriceInput/PriceInput';

import { IS_LOCAL_ENV } from '../../../../../ambient-utils/constants';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import {
    exponentialNumRegEx,
    truncateDecimals,
} from '../../../../../ambient-utils/dataLayer';
import { FlexContainer, Text } from '../../../../../styled/Common';
import { RangeContext } from '../../../../../contexts/RangeContext';

interface propsIF {
    minPricePercentage: number;
    maxPricePercentage: number;
    minPriceInputString: string;
    maxPriceInputString: string;
    setMinPriceInputString: Dispatch<SetStateAction<string>>;
    setMaxPriceInputString: Dispatch<SetStateAction<string>>;
    disable?: boolean;
    isDenomBase: boolean;
    lowBoundOnBlur: () => void;
    highBoundOnBlur: () => void;
    rangeLowTick: number;
    rangeHighTick: number;
}

function MinMaxPrice(props: propsIF) {
    const {
        minPricePercentage,
        maxPricePercentage,
        setMinPriceInputString,
        setMaxPriceInputString,
        disable,
        isDenomBase,
        lowBoundOnBlur,
        highBoundOnBlur,
        rangeLowTick,
        rangeHighTick,
    } = props;

    const {
        chainData: { gridSize: tickSize },
    } = useContext(CrocEnvContext);
    const {
        setAdvancedHighTick,
        setAdvancedLowTick,
        pinnedDisplayPrices,
        setPinnedDisplayPrices,
        minRangePrice,
        maxRangePrice,
        setMinRangePrice,
        setMaxRangePrice,
    } = useContext(RangeContext);

    const handleMinPriceChangeEvent = (
        evt?: ChangeEvent<HTMLInputElement>,
    ): void => {
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');
            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;
            const isValid = exponentialNumRegEx.test(input);
            if (isValid) {
                setMinPriceInputString(targetValue);
                const targetAsFloat: number = parseFloat(targetValue);
                isDenomBase
                    ? setMinRangePrice(targetAsFloat)
                    : setMaxRangePrice(targetAsFloat);
            }
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    const handleMaxPriceChangeEvent = (
        evt?: ChangeEvent<HTMLInputElement>,
    ): void => {
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');
            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;
            const isValid = exponentialNumRegEx.test(input);
            if (isValid) {
                setMaxPriceInputString(targetValue);
                const targetAsFloat: number = parseFloat(targetValue);
                isDenomBase
                    ? setMaxRangePrice(targetAsFloat)
                    : setMinRangePrice(targetAsFloat);
            }
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    // Update the pinnedMaxPriceDisplay or pinnedMinPriceDisplay value
    const updatePinnedPriceDisplay = (
        newMinValue?: string,
        newMaxValue?: string,
    ) => {
        if (pinnedDisplayPrices) {
            newMinValue && !newMaxValue
                ? setPinnedDisplayPrices({
                      ...pinnedDisplayPrices,
                      pinnedMinPriceDisplayTruncated: newMinValue,
                  })
                : undefined;
            newMaxValue && !newMinValue
                ? setPinnedDisplayPrices({
                      ...pinnedDisplayPrices,
                      pinnedMaxPriceDisplayTruncated: newMaxValue,
                  })
                : undefined;
        }
    };

    useEffect(() => {
        if (maxRangePrice !== undefined) {
            const high = maxRangePrice;
            setMaxPriceInputString(
                high !== undefined ? high.toString() : '0.0',
            );
            const maxPriceTruncated =
                maxRangePrice < 0.0001
                    ? maxRangePrice.toExponential(2)
                    : maxRangePrice < 2
                    ? maxRangePrice > 0.1
                        ? truncateDecimals(maxRangePrice, 4)
                        : truncateDecimals(maxRangePrice, 6)
                    : truncateDecimals(maxRangePrice, 2);
            updatePinnedPriceDisplay(undefined, maxPriceTruncated);
        }
    }, [maxRangePrice]);

    useEffect(() => {
        if (minRangePrice !== undefined) {
            const low = minRangePrice;
            setMinPriceInputString(low !== undefined ? low.toString() : '0.0');
            const minPriceTruncated =
                minRangePrice < 0.0001
                    ? minRangePrice.toExponential(2)
                    : minRangePrice < 2
                    ? minRangePrice > 0.1
                        ? truncateDecimals(minRangePrice, 4)
                        : truncateDecimals(minRangePrice, 6)
                    : truncateDecimals(minRangePrice, 2);
            updatePinnedPriceDisplay(minPriceTruncated, undefined);
        }
    }, [minRangePrice]);

    const increaseLowTick = (): void => {
        const updatedTick: number = rangeLowTick + tickSize;
        setAdvancedLowTick(updatedTick);
    };

    const increaseHighTick = (): void => {
        const updatedTick: number = rangeHighTick + tickSize;
        setAdvancedHighTick(updatedTick);
    };

    const decreaseLowTick = (): void => {
        const updatedTick: number = rangeLowTick - tickSize;
        setAdvancedLowTick(updatedTick);
    };

    const decreaseHighTick = (): void => {
        const updatedTick: number = rangeHighTick - tickSize;
        setAdvancedHighTick(updatedTick);
    };

    // event handler for blurring the `Min Price` input field
    const blurLowBoundInput = (
        event: FocusEvent<HTMLInputElement, Element>,
    ): void => {
        isDenomBase
            ? handleMinPriceChangeEvent(event)
            : handleMaxPriceChangeEvent(event);
        // flip an arbitrary bool in local state of `Range.tsx`
        lowBoundOnBlur();
    };

    // event handler for blurring the `Max Price` input field
    const blurHighBoundInput = (
        event: FocusEvent<HTMLInputElement, Element>,
    ): void => {
        isDenomBase
            ? handleMaxPriceChangeEvent(event)
            : handleMinPriceChangeEvent(event);
        // flip an arbitrary bool in local state of `Range.tsx`
        highBoundOnBlur();
    };

    return (
        <FlexContainer flexDirection='column' gap={4}>
            <FlexContainer
                alignItems='center'
                justifyContent='space-between'
                style={{
                    transition:
                        'transition: all var(--animation-speed) ease-in-out',
                }}
            >
                <PriceInput
                    fieldId='min'
                    title='Min Price'
                    percentageDifference={minPricePercentage}
                    handleChangeEvent={() => undefined}
                    onBlur={blurLowBoundInput}
                    increaseTick={
                        isDenomBase ? decreaseHighTick : increaseLowTick
                    }
                    decreaseTick={
                        isDenomBase ? increaseHighTick : decreaseLowTick
                    }
                />
                <PriceInput
                    fieldId='max'
                    title='Max Price'
                    percentageDifference={maxPricePercentage}
                    handleChangeEvent={() => undefined}
                    onBlur={blurHighBoundInput}
                    increaseTick={
                        isDenomBase ? decreaseLowTick : increaseHighTick
                    }
                    decreaseTick={
                        isDenomBase ? increaseLowTick : decreaseHighTick
                    }
                />
            </FlexContainer>
            {disable && (
                <Text fontSize='body' color='negative'>
                    Invalid range selected. The min price must be lower than the
                    max price.
                </Text>
            )}
        </FlexContainer>
    );
}

export default memo(MinMaxPrice);

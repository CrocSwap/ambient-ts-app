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

import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
} from '../../../../../utils/state/tradeDataSlice';
import { IS_LOCAL_ENV } from '../../../../../constants';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { exponentialNumRegEx } from '../../../../../utils/regex/exports';
import { FlexContainer, Text } from '../../../../../styled/Common';

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
    maxPrice: number;
    minPrice: number;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
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
        maxPrice,
        minPrice,
        setMaxPrice,
        setMinPrice,
    } = props;

    const {
        chainData: { gridSize: tickSize },
    } = useContext(CrocEnvContext);

    const dispatch = useAppDispatch();

    const handleMinPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>): void => {
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');
            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;
            const isValid = exponentialNumRegEx.test(input);
            if (isValid) {
                setMinPriceInputString(targetValue);
                const targetAsFloat: number = parseFloat(targetValue)
                isDenomBase ? setMinPrice(targetAsFloat) : setMaxPrice(targetAsFloat);
            }
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>): void => {
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');
            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;
            const isValid = exponentialNumRegEx.test(input);
            if (isValid) {
                setMaxPriceInputString(targetValue);
                const targetAsFloat: number = parseFloat(targetValue);
                isDenomBase ? setMaxPrice(targetAsFloat) : setMinPrice(targetAsFloat);
            }
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    useEffect(() => {
        if (maxPrice !== undefined && minPrice !== undefined) {
            const high = maxPrice;
            const low = minPrice;
            setMaxPriceInputString(
                high !== undefined ? high.toString() : '0.0',
            );
            setMinPriceInputString(low !== undefined ? low.toString() : '0.0');
        }
    }, [maxPrice, minPrice]);

    const increaseLowTick = (): void => {
        const updatedTick: number = rangeLowTick + tickSize;
        dispatch(setAdvancedLowTick(updatedTick));
    };

    const increaseHighTick = (): void => {
        const updatedTick: number = rangeHighTick + tickSize;
        dispatch(setAdvancedHighTick(updatedTick));
    };

    const decreaseLowTick = (): void => {
        const updatedTick: number = rangeLowTick - tickSize;
        dispatch(setAdvancedLowTick(updatedTick));
    };

    const decreaseHighTick = (): void => {
        const updatedTick: number = rangeHighTick - tickSize;
        dispatch(setAdvancedHighTick(updatedTick));
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

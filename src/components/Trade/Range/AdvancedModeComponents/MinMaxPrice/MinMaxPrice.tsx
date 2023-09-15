import {
    ChangeEvent,
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
import { useTradeData } from '../../../../../App/hooks/useTradeData';

interface MinMaxPriceIF {
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

function MinMaxPrice(props: MinMaxPriceIF) {
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

    const { updateURL } = useTradeData();

    const dispatch = useAppDispatch();

    const handleSetMinTarget = (minPriceInput: string) => {
        setMinPriceInputString(minPriceInput);
        if (!isDenomBase) {
            setMaxPrice(parseFloat(minPriceInput));
        } else {
            setMinPrice(parseFloat(minPriceInput));
        }
    };

    const handleSetMaxTarget = (maxPriceInput: string) => {
        setMaxPriceInputString(maxPriceInput);

        if (!isDenomBase) {
            setMinPrice(parseFloat(maxPriceInput));
        } else {
            setMaxPrice(parseFloat(maxPriceInput));
        }
    };

    const handleMinPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');
            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;
            const isValid = exponentialNumRegEx.test(input);

            if (isValid) {
                handleSetMinTarget(targetValue);
            }
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const targetValue = evt.target.value.replaceAll(',', '');
            const input = targetValue.startsWith('.')
                ? '0' + targetValue
                : targetValue;

            const isValid = exponentialNumRegEx.test(input);
            if (isValid) {
                handleSetMaxTarget(targetValue);
            }
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    const disableInputContent = (
        <Text fontSize='body' color='negative'>
            Invalid range selected. The min price must be lower than the max
            price.
        </Text>
    );

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
        updateURL({ update: [['lowTick', updatedTick]] });
        dispatch(setAdvancedLowTick(updatedTick));
    };

    const increaseHighTick = (): void => {
        const updatedTick: number = rangeHighTick + tickSize;
        updateURL({ update: [['highTick', updatedTick]] });
        dispatch(setAdvancedHighTick(updatedTick));
    };

    const decreaseLowTick = (): void => {
        const updatedTick: number = rangeLowTick - tickSize;
        updateURL({ update: [['lowTick', updatedTick]] });
        dispatch(setAdvancedLowTick(updatedTick));
    };

    const decreaseHighTick = (): void => {
        const updatedTick: number = rangeHighTick - tickSize;
        updateURL({ update: [['highTick', updatedTick]] });
        dispatch(setAdvancedHighTick(updatedTick));
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
                    onBlur={(event) => {
                        !isDenomBase
                            ? handleMaxPriceChangeEvent(event)
                            : handleMinPriceChangeEvent(event);
                        lowBoundOnBlur();
                    }}
                    increaseTick={
                        !isDenomBase ? increaseLowTick : decreaseHighTick
                    }
                    decreaseTick={
                        !isDenomBase ? decreaseLowTick : increaseHighTick
                    }
                />
                <PriceInput
                    fieldId='max'
                    title='Max Price'
                    percentageDifference={maxPricePercentage}
                    handleChangeEvent={() => undefined}
                    onBlur={(event) => {
                        !isDenomBase
                            ? handleMinPriceChangeEvent(event)
                            : handleMaxPriceChangeEvent(event);
                        highBoundOnBlur();
                    }}
                    increaseTick={
                        !isDenomBase ? increaseHighTick : decreaseLowTick
                    }
                    decreaseTick={
                        !isDenomBase ? decreaseHighTick : increaseLowTick
                    }
                />
            </FlexContainer>
            {disable && disableInputContent}
        </FlexContainer>
    );
}

export default memo(MinMaxPrice);

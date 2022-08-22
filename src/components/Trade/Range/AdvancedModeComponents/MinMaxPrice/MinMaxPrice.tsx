import { ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import styles from './MinMaxPrice.module.css';
import PriceInput from '../PriceInput/PriceInput';

import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setTargetData,
    targetData,
} from '../../../../../utils/state/tradeDataSlice';

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
    setRangeLowTick: Dispatch<SetStateAction<number>>;
    setRangeHighTick: Dispatch<SetStateAction<number>>;
    chainId: string;
    targetData: targetData[];
}

export default function MinMaxPrice(props: MinMaxPriceIF) {
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
        setRangeLowTick,
        setRangeHighTick,
        chainId,
        targetData,
    } = props;

    const dispatch = useAppDispatch();

    const handleMinPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const minPriceInput = evt.target.value;
            setMinPriceInputString(minPriceInput);

            console.log({ minPriceInput });
            const newTargetData: targetData[] = [
                { name: !isDenomBase ? 'high' : 'low', value: parseFloat(minPriceInput) },
                {
                    name: !isDenomBase ? 'low' : 'high',
                    value: targetData.filter(
                        (target) => target.name === (!isDenomBase ? 'low' : 'high'),
                    )[0].value,
                },
            ];

            dispatch(setTargetData(newTargetData));
        } else {
            console.log('no event');
        }
    };

    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const maxPriceInput = evt.target.value;
            setMaxPriceInputString(maxPriceInput);

            console.log({ maxPriceInput });
            const newTargetData: targetData[] = [
                { name: !isDenomBase ? 'low' : 'high', value: parseFloat(maxPriceInput) },
                {
                    name: !isDenomBase ? 'high' : 'low',
                    value: targetData.filter(
                        (target) => target.name === (!isDenomBase ? 'high' : 'low'),
                    )[0].value,
                },
            ];

            dispatch(setTargetData(newTargetData));
        } else {
            console.log('no event');
        }
    };

    const disableInputContent = (
        <div className={styles.disable_text}>
            Invalid range selected. The min price must be lower than the max price.
        </div>
    );

    useEffect(() => {
        console.log({ targetData });

        if (targetData !== undefined) {
            const high = targetData.filter((data) => {
                return data.name === 'high';
            })[0].value;
            const low = targetData.filter((data) => {
                return data.name === 'low';
            })[0].value;

            setMaxPriceInputString(high !== undefined ? high.toString() : '0.0');
            setMinPriceInputString(low !== undefined ? low.toString() : '0.0');
        }
    }, [targetData]);

    const tickSize = lookupChain(chainId).gridSize;

    const increaseLowTick = () => {
        setRangeLowTick(rangeLowTick + tickSize);
        dispatch(setAdvancedLowTick(rangeLowTick + tickSize));
    };
    const increaseHighTick = () => {
        setRangeHighTick(rangeHighTick + tickSize);
        dispatch(setAdvancedHighTick(rangeHighTick + tickSize));
    };
    const decreaseLowTick = () => {
        setRangeLowTick(rangeLowTick - tickSize);
        dispatch(setAdvancedLowTick(rangeLowTick - tickSize));
    };
    const decreaseHighTick = () => {
        setRangeHighTick(rangeHighTick - tickSize);
        dispatch(setAdvancedHighTick(rangeHighTick - tickSize));
    };

    return (
        <div className={styles.min_max_container}>
            <div className={styles.min_max_content}>
                <PriceInput
                    fieldId='min'
                    title='Min Price'
                    percentageDifference={minPricePercentage}
                    handleChangeEvent={
                        !isDenomBase ? handleMaxPriceChangeEvent : handleMinPriceChangeEvent
                    }
                    onBlur={lowBoundOnBlur}
                    increaseTick={!isDenomBase ? increaseLowTick : decreaseHighTick}
                    decreaseTick={!isDenomBase ? decreaseLowTick : increaseHighTick}
                />
                <PriceInput
                    fieldId='max'
                    title='Max Price'
                    percentageDifference={maxPricePercentage}
                    handleChangeEvent={
                        !isDenomBase ? handleMinPriceChangeEvent : handleMaxPriceChangeEvent
                    }
                    onBlur={highBoundOnBlur}
                    increaseTick={!isDenomBase ? increaseHighTick : decreaseLowTick}
                    decreaseTick={!isDenomBase ? decreaseHighTick : increaseLowTick}
                />
            </div>
            {disable && disableInputContent}
        </div>
    );
}

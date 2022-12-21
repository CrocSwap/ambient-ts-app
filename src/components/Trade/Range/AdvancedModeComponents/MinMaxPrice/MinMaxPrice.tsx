import { ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import styles from './MinMaxPrice.module.css';
import PriceInput from '../PriceInput/PriceInput';

import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setRangeModuleTriggered,
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
    // setRangeLowTick: Dispatch<SetStateAction<number>>;
    // setRangeHighTick: Dispatch<SetStateAction<number>>;
    chainId: string;
    targetData: targetData[];
    isRangeCopied: boolean;
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
        // setRangeLowTick,
        // setRangeHighTick,
        chainId,
        targetData,
        isRangeCopied,
    } = props;

    const dispatch = useAppDispatch();

    const handleSetMinTarget = (minPriceInput: string) => {
        setMinPriceInputString(minPriceInput);

        const newTargetData: targetData[] = [
            { name: !isDenomBase ? 'Max' : 'Min', value: parseFloat(minPriceInput) },
            {
                name: !isDenomBase ? 'Min' : 'Max',
                value: targetData.filter(
                    (target) => target.name === (!isDenomBase ? 'Min' : 'Max'),
                )[0].value,
            },
        ];
        dispatch(setTargetData(newTargetData));
        dispatch(setRangeModuleTriggered(true));
    };

    const handleSetMaxTarget = (maxPriceInput: string) => {
        setMaxPriceInputString(maxPriceInput);

        const newTargetData: targetData[] = [
            { name: !isDenomBase ? 'Min' : 'Max', value: parseFloat(maxPriceInput) },
            {
                name: !isDenomBase ? 'Max' : 'Min',
                value: targetData.filter(
                    (target) => target.name === (!isDenomBase ? 'Max' : 'Min'),
                )[0].value,
            },
        ];

        dispatch(setTargetData(newTargetData));
        dispatch(setRangeModuleTriggered(true));
    };

    const handleMinPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const minPriceInput = evt.target.value;
            handleSetMinTarget(minPriceInput);
        } else {
            console.log('no event');
        }
    };

    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const maxPriceInput = evt.target.value;
            handleSetMaxTarget(maxPriceInput);
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
        if (targetData !== undefined) {
            const high = targetData.filter((data) => {
                return data.name === 'Max';
            })[0].value;
            const low = targetData.filter((data) => {
                return data.name === 'Min';
            })[0].value;

            setMaxPriceInputString(high !== undefined ? high.toString() : '0.0');
            setMinPriceInputString(low !== undefined ? low.toString() : '0.0');

            // lowBoundOnBlur();
            // highBoundOnBlur();
        }
    }, [JSON.stringify(targetData)]);

    const tickSize = lookupChain(chainId).gridSize;

    const increaseLowTick = () => {
        // setRangeLowTick(rangeLowTick + tickSize);

        dispatch(setAdvancedLowTick(rangeLowTick + tickSize));
    };
    const increaseHighTick = () => {
        // setRangeHighTick(rangeHighTick + tickSize);
        dispatch(setAdvancedHighTick(rangeHighTick + tickSize));
    };
    const decreaseLowTick = () => {
        // setRangeLowTick(rangeLowTick - tickSize);
        dispatch(setAdvancedLowTick(rangeLowTick - tickSize));
    };
    const decreaseHighTick = () => {
        // setRangeHighTick(rangeHighTick - tickSize);
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
                    isRangeCopied={isRangeCopied}
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
                    isRangeCopied={isRangeCopied}
                />
            </div>
            {disable && disableInputContent}
        </div>
    );
}

// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import Local Files
import styles from './EditMinMaxPrice.module.css';
import EditPriceInput from '../EditPriceInput/EditPriceInput';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
} from '../../../../utils/state/tradeDataSlice';
import { IS_LOCAL_ENV } from '../../../../constants';

// interface for React functional component props
interface EditMinMaxPricePropsIF {
    minPrice: string;
    maxPrice: string;
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
}

// React functional component
export default function EditMinMaxPrice(props: EditMinMaxPricePropsIF) {
    const dispatch = useAppDispatch();

    const {
        minPrice,
        maxPrice,
        minPricePercentage,
        maxPricePercentage,
        setMinPriceInputString,
        setMaxPriceInputString,
        isDenomBase,
        lowBoundOnBlur,
        highBoundOnBlur,
        rangeLowTick,
        rangeHighTick,
        setRangeLowTick,
        setRangeHighTick,
        chainId,
    } = props;

    const handleMinPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const minPriceInput = evt.target.value;
            setMinPriceInputString(minPriceInput);
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const maxPriceInput = evt.target.value;
            setMaxPriceInputString(maxPriceInput);
        } else {
            IS_LOCAL_ENV && console.debug('no event');
        }
    };

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className={styles.min_max_container}
        >
            <EditPriceInput
                fieldId='edit-base'
                title='Min Price'
                percentageDifference={minPricePercentage}
                value={minPrice}
                handleChangeEvent={
                    !isDenomBase
                        ? handleMaxPriceChangeEvent
                        : handleMinPriceChangeEvent
                }
                onBlur={lowBoundOnBlur}
                increaseTick={!isDenomBase ? increaseLowTick : decreaseHighTick}
                decreaseTick={!isDenomBase ? decreaseLowTick : increaseHighTick}
            />
            <EditPriceInput
                fieldId='edit-quote'
                title='Max Price'
                percentageDifference={maxPricePercentage}
                value={maxPrice}
                handleChangeEvent={
                    !isDenomBase
                        ? handleMinPriceChangeEvent
                        : handleMaxPriceChangeEvent
                }
                onBlur={highBoundOnBlur}
                increaseTick={!isDenomBase ? increaseHighTick : decreaseLowTick}
                decreaseTick={!isDenomBase ? decreaseHighTick : increaseLowTick}
            />
        </motion.div>
    );
}

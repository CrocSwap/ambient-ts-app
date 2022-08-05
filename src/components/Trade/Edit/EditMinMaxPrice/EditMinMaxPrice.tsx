import styles from './EditMinMaxPrice.module.css';
import EditPriceInput from '../EditPriceInput/EditPriceInput';
import { motion } from 'framer-motion';
import { ChangeEvent } from 'react';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setAdvancedHighTick, setAdvancedLowTick } from '../../../../utils/state/tradeDataSlice';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

interface EditMinMaxPriceProps {
    minPrice: string;
    maxPrice: string;

    minPricePercentage: number;
    maxPricePercentage: number;
    minPriceInputString: string;
    maxPriceInputString: string;
    setMinPriceInputString: React.Dispatch<React.SetStateAction<string>>;
    setMaxPriceInputString: React.Dispatch<React.SetStateAction<string>>;
    // disable?: boolean;
    disable?: boolean;
    isDenomBase: boolean;
    // highBoundOnFocus: () => void;
    lowBoundOnBlur: () => void;
    highBoundOnBlur: () => void;
    rangeLowTick: number;
    rangeHighTick: number;
    setRangeLowTick: React.Dispatch<React.SetStateAction<number>>;
    setRangeHighTick: React.Dispatch<React.SetStateAction<number>>;
    chainId: string;
}
export default function EditMinMaxPrice(props: EditMinMaxPriceProps) {
    const dispatch = useAppDispatch();

    const {
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
            console.log('no event');
        }

        //   const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        //   if (buyQtyField) {
        //       buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        //   }
    };
    const handleMaxPriceChangeEvent = (evt?: ChangeEvent<HTMLInputElement>) => {
        if (evt) {
            const maxPriceInput = evt.target.value;
            setMaxPriceInputString(maxPriceInput);
        } else {
            console.log('no event');
        }

        //   const buyQtyField = document.getElementById('buy-limit-quantity') as HTMLInputElement;

        //   if (buyQtyField) {
        //       buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        //   }
    };

    const tickSize = lookupChain(chainId).poolIndex;

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
                value={props.minPrice}
                handleChangeEvent={
                    !isDenomBase ? handleMaxPriceChangeEvent : handleMinPriceChangeEvent
                }
                // onFocus={highBoundOnFocus}
                onBlur={lowBoundOnBlur}
                increaseTick={!isDenomBase ? increaseLowTick : decreaseHighTick}
                decreaseTick={!isDenomBase ? decreaseLowTick : increaseHighTick}
            />
            <EditPriceInput
                fieldId='edit-quote'
                title='Max Price'
                percentageDifference={maxPricePercentage}
                value={props.maxPrice}
                handleChangeEvent={
                    !isDenomBase ? handleMinPriceChangeEvent : handleMaxPriceChangeEvent
                }
                // onFocus={highBoundOnFocus}
                onBlur={highBoundOnBlur}
                increaseTick={!isDenomBase ? increaseHighTick : decreaseLowTick}
                decreaseTick={!isDenomBase ? decreaseHighTick : increaseLowTick}
            />
        </motion.div>
    );
}

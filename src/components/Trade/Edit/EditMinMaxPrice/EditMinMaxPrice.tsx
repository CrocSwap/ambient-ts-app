import styles from './EditMinMaxPrice.module.css';
import EditPriceInput from '../EditPriceInput/EditPriceInput';
import MinMaxPrice from '../../Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import { motion } from 'framer-motion';

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
}
export default function EditMinMaxPrice(props: EditMinMaxPriceProps) {
    console.log('HERE', props.minPrice);

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
                percentageDifference={-15}
                value={props.minPrice}
            />
            <EditPriceInput
                fieldId='edit-quote'
                title='Max Price'
                percentageDifference={15}
                value={props.maxPrice}
            />
        </motion.div>
    );
}

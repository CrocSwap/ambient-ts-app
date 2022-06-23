import styles from './EditMinMaxPrice.module.css';
import EditPriceInput from '../EditPriceInput/EditPriceInput';
import MinMaxPrice from '../../Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';
import { motion } from 'framer-motion';

interface EditMinMaxPriceProps {
    minPrice: string;
    maxPrice: string;
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

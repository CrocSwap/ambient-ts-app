import styles from './EditMinMaxPrice.module.css';
import EditPriceInput from '../EditPriceInput/EditPriceInput';
import MinMaxPrice from '../../Range/AdvancedModeComponents/MinMaxPrice/MinMaxPrice';

interface EditMinMaxPriceProps {
    minPrice: string;
    maxPrice: string;
}
export default function EditMinMaxPrice(props: EditMinMaxPriceProps) {
    console.log('HERE', props.minPrice);

    return (
        <div className={styles.min_max_container}>
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
        </div>
    );
}

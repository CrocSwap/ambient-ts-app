import styles from './EditMinMaxPrice.module.css';
import EditPriceInput from '../EditPriceInput/EditPriceInput';

export default function EditMinMaxPrice() {
    return (
        <div className={styles.min_max_container}>
            <EditPriceInput fieldId='edit-base' title='Min Price' percentageDifference={-15} />
            <EditPriceInput fieldId='edit-quote' title='Max Price' percentageDifference={15} />
        </div>
    );
}

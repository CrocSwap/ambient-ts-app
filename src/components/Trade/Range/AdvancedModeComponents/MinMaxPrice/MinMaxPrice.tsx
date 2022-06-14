import styles from './MinMaxPrice.module.css';
import PriceInput from '../PriceInput/PriceInput';

export default function MinMaxPrice() {
    return (
        <div className={styles.min_max_container}>
            <PriceInput fieldId='min' title='Min Price' percentageDifference={-15} />
            <PriceInput fieldId='max' title='Max Price' percentageDifference={15} />
        </div>
    );
}

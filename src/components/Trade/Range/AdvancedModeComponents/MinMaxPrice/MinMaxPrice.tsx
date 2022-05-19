import styles from './MinMaxPrice.module.css';
import PriceInput from '../PriceInput/PriceInput';

export default function MinMaxPrice() {
    return (
        <div className={styles.min_max_container}>
            <PriceInput fieldId='base' title='Min Price' percentageDifference={-15} />
            <PriceInput fieldId='quote' title='Max Price' percentageDifference={15} />
        </div>
    );
}

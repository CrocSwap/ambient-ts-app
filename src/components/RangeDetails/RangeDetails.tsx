import Divider from '../Global/Divider/Divider';
import RemoveRangeHeader from '../RemoveRange/RemoveRangeHeader/RemoveRangeHeader';
import PriceInfo from './PriceInfo/PriceInfo';
import styles from './RangeDetails.module.css';
import TokenInfo from './TokenInfo/TokenInfo';

export default function RangeDetails() {
    return (
        <div className={styles.range_details_container}>
            <RemoveRangeHeader />
            <div className={styles.main_content}>
                <TokenInfo />
                <Divider />
            </div>
            <PriceInfo />
        </div>
    );
}

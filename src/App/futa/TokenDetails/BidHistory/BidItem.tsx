import { MdOutlineRemoveCircleOutline } from 'react-icons/md';
import styles from './BidHistory.module.css';

interface BidItemProps {
    fdvValue: string | number;
    dollarValue: string | number;
    onRemove: () => void;
}

export default function BidItem(props: BidItemProps) {
    const { fdvValue, dollarValue, onRemove } = props;

    return (
        <div className={styles.bidRowContainer}>
            <MdOutlineRemoveCircleOutline size={24} onClick={onRemove} />
            <p>$ {fdvValue} FDV</p>
            <p>$ {dollarValue}</p>
        </div>
    );
}

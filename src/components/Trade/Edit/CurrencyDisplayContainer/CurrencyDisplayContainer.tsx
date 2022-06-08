import CurrencyDisplay from '../CurrencyDisplay/CurrencyDisplay';
import styles from './CurrencyDisplayContainer.module.css';

interface CurrencyDisplayContainerProps {
    children: React.ReactNode;
}

export default function CurrencyDisplayContainer(props: CurrencyDisplayContainerProps) {
    return (
        <div className={styles.row}>
            <CurrencyDisplay />
            <CurrencyDisplay />
        </div>
    );
}

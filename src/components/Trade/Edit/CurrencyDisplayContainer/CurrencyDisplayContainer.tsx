import CurrencyDisplay from '../CurrencyDisplay/CurrencyDisplay';
import styles from './CurrencyDisplayContainer.module.css';

// interface CurrencyDisplayContainerProps {
//     children: React.ReactNode;
// }

export default function CurrencyDisplayContainer() {
    return (
        <div className={styles.container}>
            <CurrencyDisplay />
            <CurrencyDisplay />
        </div>
    );
}

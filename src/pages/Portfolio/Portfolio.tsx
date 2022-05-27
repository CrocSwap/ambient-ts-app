import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import styles from './Portfolio.module.css';

export default function Portfolio() {
    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner />
        </main>
    );
}

import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import styles from './Portfolio.module.css';

export default function Portfolio() {
    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <h1>This is Portfolio.tsx</h1>
            <PortfolioBanner />
        </main>
    );
}

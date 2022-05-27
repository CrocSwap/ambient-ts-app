import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';

export default function Portfolio() {
    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner />
            <PortfolioTabs />
            <div className={styles.title}>Exchange Balance</div>
            <div className={styles.exchange_balance}>
                <ExchangeBalance />
            </div>
        </main>
    );
}

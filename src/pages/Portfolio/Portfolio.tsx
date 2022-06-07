import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';
import { SetStateAction } from 'react';

interface PortfolioProps {
    showEditComponent: boolean;
    setShowEditComponent: React.Dispatch<SetStateAction<boolean>>;
}
export default function Portfolio(props: PortfolioProps) {
    const { showEditComponent, setShowEditComponent } = props;
    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner />
            <PortfolioTabs
                showEditComponent={showEditComponent}
                setShowEditComponent={setShowEditComponent}
                notOntradeRoute
            />
            <div className={styles.title}>Exchange Balance</div>
            <div className={styles.exchange_balance}>
                <ExchangeBalance />
            </div>
        </main>
    );
}

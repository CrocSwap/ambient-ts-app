import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';

interface PortfolioPropsIF {
    ensName: string;
    connectedAccount: string;
    imageData: string[];
}

export default function Portfolio(props: PortfolioPropsIF) {
    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            <PortfolioBanner
                ensName={props.ensName}
                connectedAccount={props.connectedAccount}
                imageData={props.imageData}
            />
            <PortfolioTabs />
            <div className={styles.title}>Exchange Balance</div>
            <div className={styles.exchange_balance}>
                <ExchangeBalance />
            </div>
        </main>
    );
}

import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';

export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
}

export default function Auctions() {
    return (
        <div className={styles.auctions_main}>
            <h3>AUCTIONS</h3>
            <SearchableTicker />
        </div>
    );
}

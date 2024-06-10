import styles from './AuctionItem.module.css';
import { Link } from 'react-router-dom';

import { auctionDataIF } from './Auctions';

export default function AuctionItem(props: auctionDataIF) {
    const { ticker, marketCap, timeRem } = props;

    type timesRemaining = 'time_left' | 'time_left_low';

    function getTimeColor(t: string): timesRemaining {
        let output: timesRemaining;
        switch (t) {
            case '05m':
            case '01h':
            case '40m':
                output = 'time_left_low';
                break;
            default:
                output = 'time_left';
                break;
        }
        return output;
    }

    return (
        <Link className={styles.auction_item} to={'/auctions/v1/' + ticker}>
            <div className={styles.ticker}>{ticker}</div>
            <div className={styles.market_cap}>{'$' + marketCap}</div>
            <div className={styles[getTimeColor(timeRem)]}>{timeRem}</div>
        </Link>
    );
}

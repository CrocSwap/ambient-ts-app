import styles from './AuctionItem.module.css';
import { Link } from 'react-router-dom';

import { auctionDataIF } from './Auctions';

export default function AuctionItem(props: auctionDataIF) {
    const { ticker, marketCap, timeRem } = props;

    return (
        <Link className={styles.auction_item} to={''}>
            <div>{ticker}</div>
            <div>{'$' + marketCap}</div>
            <div>{timeRem}</div>
        </Link>
    );
}

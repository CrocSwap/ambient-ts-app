import styles from './AuctionCard.module.css';
import { auctionDataIF } from './Auctions';

interface propsIF {
    auction: auctionDataIF;
}

export default function AuctionCard(props: propsIF) {
    const { auction } = props;

    return (
        // this will later be a <Link /> element
        <div className={styles.auction_card}>
            <div className={styles.auction_image}>
                <h3>{auction.name}</h3>
            </div>
            <div className={styles.auction_info}></div>
        </div>
    );
}

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
            <div className={styles.auction_image_box}>
                <div>{'(IMAGE HERE)'}</div>
                <p>{'by 0xZZZ...ZZZ'}</p>
            </div>
            <div className={styles.auction_info}>
                <div className={styles.info_header}>
                    <h4>{auction.ticker}</h4>
                    <h5>{auction.auctionPrice}</h5>
                </div>
                <div className={styles.info_sub_header}>
                    <h5>{auction.name}</h5>
                    <h5>{auction.comments.length}</h5>
                </div>
                <p className={styles.description}>{auction.desc}</p>
            </div>
        </div>
    );
}

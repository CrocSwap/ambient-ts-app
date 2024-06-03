import { BsChatLeftText } from 'react-icons/bs';
import { trimString } from '../../ambient-utils/dataLayer';
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
                <p className={styles.auction_maker}>
                    {trimString(auction.author, 6, 4, '...')}
                </p>
            </div>
            <div className={styles.auction_info}>
                <div className={styles.info_header}>
                    <h4>{auction.ticker}</h4>
                    <h5>{auction.marketCap}</h5>
                </div>
                <div className={styles.info_sub_header}>
                    <h5>{auction.name}</h5>
                    <h5 className={styles.comments}>
                        <BsChatLeftText />
                        {auction.comments.length}
                    </h5>
                </div>
                <p className={styles.description}>{auction.desc}</p>
            </div>
        </div>
    );
}

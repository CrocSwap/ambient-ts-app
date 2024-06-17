import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import styles from './Account.module.css';

import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/Divider';
import { mockAuctionData } from '../mockAuctionData';
import {
    sortedAuctionsIF,
    useSortedAuctions,
} from '../Auctions/useSortedAuctions';

export default function Account() {
    const claimAllContainer = (
        <div className={styles.claimAllContainer}>
            <h3>CLAIM ALL</h3>
            <p>CLAIM ALL TOKENS FROM WINNING AUCTIONS AND UNUSED BIDS</p>

            <div className={styles.extraFeeContainer}>
                <div className={styles.alignCenter}>
                    <p>NETWORK FEE</p>
                    <TooltipComponent title='Estimated network fee (i.e. gas cost) to join bid' />
                </div>
                <p style={{ color: 'var(--text2)' }}>~0.01</p>
            </div>
        </div>
    );

    const sorted: sortedAuctionsIF = useSortedAuctions(mockAuctionData);

    const desktopScreen = useMediaQuery('(min-width: 1280px)');

    const desktopVersion = (
        <div className={styles.desktopContainer}>
            <div className={styles.content}>
                <SearchableTicker auctions={sorted} title='account' />
            </div>

            <div className={styles.rightLayout}>
                <Divider count={2} />
                {claimAllContainer}
                <button className={styles.claimButton}>CLAIM ALL</button>
            </div>
        </div>
    );

    if (desktopScreen) return desktopVersion;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <BreadCrumb />
                <h2>Account</h2>
                <SearchableTicker auctions={sorted} />
            </div>
            {claimAllContainer}
            <button className={styles.claimButton}>CLAIM ALL</button>
        </div>
    );
}

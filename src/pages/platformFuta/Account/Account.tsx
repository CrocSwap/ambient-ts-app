import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import styles from './Account.module.css';

import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/Divider';
import {
    sortedAuctionsIF,
    useSortedAuctions,
} from '../Auctions/useSortedAuctions';
import { useContext } from 'react';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import Typewriter from '../../../components/Futa/TypeWriter/TypeWriter';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { Link } from 'react-router-dom';

export default function Account() {
    const { accountData } = useContext(AuctionsContext);
    const { isUserConnected } = useContext(UserDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

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
            <button className={styles.claimButton}>CLAIM ALL</button>
        </div>
    );

    const connectWalletContent = (
        <div className={styles.connectWalletContent}>
            <Typewriter text='Connect your wallet to view your auctions' />
            <button onClick={openWalletModal}>Connect wallet</button>
        </div>
    );

    const noAuctionsContent = (
        <div className={styles.connectWalletContent}>
            <Typewriter text='No auctions found' />
            <p>Consider viewing all auctions</p>
            <Link to='/auctions'>All auctions</Link>
        </div>
    );
    const sorted: sortedAuctionsIF = useSortedAuctions(accountData.auctions);
    const desktopScreen = useMediaQuery('(min-width: 1080px)');

    if (!isUserConnected) {
        return connectWalletContent;
    }

    if (!sorted?.data?.length) {
        return noAuctionsContent;
    }

    return desktopScreen ? (
        <div className={styles.desktopContainer}>
            <div className={styles.content}>
                <SearchableTicker
                    auctions={sorted}
                    title='account'
                    isAccount={true}
                />
            </div>

            <div className={styles.rightLayout}>
                <Divider count={2} />
                {claimAllContainer}
            </div>
        </div>
    ) : (
        <div className={styles.container}>
            <div className={styles.content}>
                <BreadCrumb />
                <h2>Account</h2>
                <SearchableTicker auctions={sorted} isAccount={true} />
            </div>
            {claimAllContainer}
        </div>
    );
}

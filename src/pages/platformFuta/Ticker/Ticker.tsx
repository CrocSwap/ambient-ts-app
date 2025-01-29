// import{ useEffect, useState } from 'react';
import styles from './Ticker.module.css';

import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Auctions from '../Auctions/Auctions';
// import{ useParams } from 'react-router-dom';

import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
// import{ AuctionDataIF } from '../../../contexts/AuctionsContext';

export default function Ticker() {
    // // setState for auction details
    // const [auctionDetails, setAuctionDetails] = useState<
    //     AuctionDataIF | undefined
    // >();

    // useEffect(() => {
    //     if (!tickerFromParams) return;
    //     Promise.resolve(getAuctionDetails(tickerFromParams)).then((details) =>
    //         setAuctionDetails(details),
    //     );
    // }, [tickerFromParams]);

    const desktopScreen = useMediaQuery('(min-width: 1280px)');

    const desktopVersion = (
        <div className={styles.gridContainer}>
            {<Auctions />}
            <TickerComponent isAuctionPage />
        </div>
    );

    if (desktopScreen) return desktopVersion;

    return (
        <div className={styles.container}>
            <TickerComponent />
        </div>
    );
}

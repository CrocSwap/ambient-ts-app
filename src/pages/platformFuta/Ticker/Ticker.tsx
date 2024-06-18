import { useEffect, useState } from 'react';
import styles from './Ticker.module.css';

import Auctions from '../Auctions/Auctions';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { useParams } from 'react-router-dom';

import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';

export default function Ticker() {
    const { ticker: tickerFromParams } = useParams();

    const getAuctionDetails = async (ticker: string) => {
        console.log({ ticker });
        if (
            ticker.toLowerCase() === 'doge' ||
            ticker.toLowerCase() === 'not' ||
            ticker.toLowerCase() === 'mog' ||
            ticker.toLowerCase() === 'mew'
        )
            return { status: 'CLOSED' };

        return { status: 'OPEN' };
    };

    // setState for auction details
    const [auctionDetails, setAuctionDetails] = useState<
        { status: string } | undefined
    >();

    useEffect(() => {
        if (!tickerFromParams) return;
        Promise.resolve(getAuctionDetails(tickerFromParams)).then((details) =>
            setAuctionDetails(details),
        );
    }, [tickerFromParams]);

    const desktopScreen = useMediaQuery('(min-width: 1280px)');

    const desktopVersion = (
        <div className={styles.gridContainer}>
            {<Auctions hideTicker={auctionDetails !== null} />}
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

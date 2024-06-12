import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import ConsoleComponent from '../../../components/Futa/ConsoleComponent/ConsoleComponent';
import Divider from '../../../components/Futa/Divider/Divider';
import AuctionLoader from '../../../components/Futa/AuctionLoader/AuctionLoader';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { useContext, useState } from 'react';
import Ticker from '../Ticker/Ticker';

export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
}

export default function Auctions() {
    const {
        // isLoading,
        setIsLoading,
        // auctions,
    } = useContext(AuctionsContext);

    const desktopScreen = useMediaQuery('(min-width: 1280px)');
    const [isFullLayoutActive, setIsFullLayoutActive] = useState(false);
    const customLoading = false;

    const chartContent = (
        <div className={styles.chart}>
            <div className={styles.chartLeft}>
                <h3>CHARTS</h3>
            </div>
            <div className={styles.chartRight}>
                <h3>COMMENTS</h3>
            </div>
        </div>
    );
    const auctionOrLoader = customLoading ? (
        <AuctionLoader setIsLoading={setIsLoading} />
    ) : (
        <div className={styles.auctionsTickerContainer}>
            <div
                className={
                    isFullLayoutActive
                        ? styles.middleContentFull
                        : styles.middleContent
                }
            >
                <SearchableTicker
                    showAuctionTitle
                    setIsFullLayoutActive={setIsFullLayoutActive}
                />
                {isFullLayoutActive && chartContent}
            </div>
            <Ticker />
        </div>
    );

    const desktopVersion = (
        <div
            className={
                isFullLayoutActive
                    ? styles.desktopContainerFull
                    : styles.desktopContainer
            }
        >
            {isFullLayoutActive && <ConsoleComponent />}
            <div className={styles.auctions_main}>
                <Divider count={2} />
                <section style={{ height: '100%' }}>{auctionOrLoader}</section>
            </div>
        </div>
    );
    if (desktopScreen) return desktopVersion;
    return (
        <div className={styles.auctions_main}>
            <h3>AUCTIONS</h3>
            <SearchableTicker />
        </div>
    );
}

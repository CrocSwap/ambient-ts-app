import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/Divider';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { useContext, useState } from 'react';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
import ConsoleComponent from '../../../components/Futa/ConsoleComponent/ConsoleComponent';
import Chart from '../../../components/Futa/Chart/Chart';

export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
}

interface PropsIF {
    hideTicker?: boolean;
    placeholderTicker?: boolean;
}
export default function Auctions(props: PropsIF) {
    const { hideTicker, placeholderTicker } = props;
    const {
        // isLoading,
        setIsLoading,
        // auctions,
    } = useContext(AuctionsContext);

    const desktopScreen = useMediaQuery('(min-width: 1280px)');
    const [isFullLayoutActive, setIsFullLayoutActive] = useState(false);
    const customLoading = false;

    const consoleAndChartDisplay = (
        <div className={styles.consoleChartComponent}>
            <ConsoleComponent />
            <Divider vertical count={2} />
            <Chart />
        </div>
    );

    const auctionsAndChart = (
        <div className={styles.auctionChartContainer}>
            <SearchableTicker
                showAuctionTitle
                setIsFullLayoutActive={setIsFullLayoutActive}
            />
            {consoleAndChartDisplay}
        </div>
    );
    const auctionAndTicker = (
        <div
            className={styles.auctionsTickerContainer}
            style={{ gridTemplateColumns: hideTicker ? '1fr' : '1fr 390px' }}
        >
            {/* <SearchableTicker
                    showAuctionTitle
                    setIsFullLayoutActive={setIsFullLayoutActive}
                /> */}
            {auctionsAndChart}
            <div className={styles.flexColumn}>
                <Divider count={2} />
                {!hideTicker && (
                    <TickerComponent
                        isAuctionPage
                        placeholderTicker={placeholderTicker}
                    />
                )}
            </div>
        </div>
    );

    const desktopVersion = (
        <div className={styles.desktopContainer}>{auctionAndTicker}</div>
    );

    if (desktopScreen) return desktopVersion;

    return (
        <div className={styles.mobileContainer}>
            <h3>AUCTIONS</h3>
            <SearchableTicker />
        </div>
    );
}

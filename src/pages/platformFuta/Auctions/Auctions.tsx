import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/Divider';
import {
    useContext,
    // useEffect,
    useState,
} from 'react';
import { sortedAuctionsIF, useSortedAuctions } from './useSortedAuctions';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
import ConsoleComponent from '../../../components/Futa/ConsoleComponent/ConsoleComponent';
import Chart from '../../../components/Futa/Chart/Chart';
import { AuctionsContext } from '../../../contexts/AuctionsContext';

interface propsIF {
    hideTicker?: boolean;
    placeholderTicker?: boolean;
}

export default function Auctions(props: propsIF) {
    const { hideTicker, placeholderTicker } = props;
    // placeholder data until the platform has live data

    const { auctions } = useContext(AuctionsContext);

    const sorted: sortedAuctionsIF = useSortedAuctions(auctions.data);
    // useEffect(() => {
    //     console.log(auctions.data);
    // }, [auctions.data]);
    // useEffect(() => {console.log(sorted);}, [sorted]);

    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

    false && INPUT_DOM_ID;

    const desktopScreen: boolean = useMediaQuery('(min-width: 1280px)');
    const [isFullLayoutActive, setIsFullLayoutActive] =
        useState<boolean>(false);

    if (desktopScreen)
        return (
            <div className={styles.desktopContainer}>
                <div
                    className={styles.auctionsTickerContainer}
                    style={{
                        gridTemplateColumns: hideTicker ? '1fr' : '1fr 390px',
                    }}
                >
                    {isFullLayoutActive ? (
                        <div className={styles.auctionChartContainer}>
                            <div style={{ height: '50vh' }}>
                                <SearchableTicker
                                    auctions={sorted}
                                    title='Auctions'
                                    setIsFullLayoutActive={
                                        setIsFullLayoutActive
                                    }
                                />
                            </div>

                            <div className={styles.consoleChartComponent}>
                                <ConsoleComponent />
                                <span />
                                <Chart />
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: 'calc(100vh - 200px)' }}>
                            <SearchableTicker
                                auctions={sorted}
                                title='AUCTIONS'
                                setIsFullLayoutActive={setIsFullLayoutActive}
                                placeholderTicker={placeholderTicker}
                            />
                        </div>
                    )}
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
            </div>
        );

    return (
        <div className={styles.mobileContainer}>
            <h3>AUCTIONS</h3>
            <SearchableTicker
                auctions={sorted}
                placeholderTicker={placeholderTicker}
            />
        </div>
    );
}

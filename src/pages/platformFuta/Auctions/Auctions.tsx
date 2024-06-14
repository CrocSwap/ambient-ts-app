import styles from './Auctions.module.css';
import SearchableTicker from '../../../components/Futa/SearchableTicker/SearchableTicker';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Divider from '../../../components/Futa/Divider/Divider';
import { useState } from 'react';
import { sortedAuctions, useSortedAuctions } from './useSortedAuctions';
import TickerComponent from '../../../components/Futa/TickerComponent/TickerComponent';
import ConsoleComponent from '../../../components/Futa/ConsoleComponent/ConsoleComponent';
import Chart from '../../../components/Futa/Chart/Chart';

export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
}

interface propsIF {
    hideTicker?: boolean;
    placeholderTicker?: boolean;
}

export default function Auctions(props: propsIF) {
    const { hideTicker, placeholderTicker } = props;
    // placeholder data until the platform has live data
    const rawData: auctionDataIF[] = [
        {
            ticker: 'DOGE',
            marketCap: 67316,
            timeRem: '40m',
        },
        {
            ticker: 'PEPE',
            marketCap: 34466,
            timeRem: '15h',
        },
        {
            ticker: 'BODEN',
            marketCap: 27573,
            timeRem: '21h',
        },
        {
            ticker: 'APU',
            marketCap: 979579,
            timeRem: '07h',
        },
        {
            ticker: 'BOME',
            marketCap: 626930,
            timeRem: '40m',
        },
        {
            ticker: 'USA',
            marketCap: 11294,
            timeRem: '05h',
        },
        {
            ticker: 'BITCOIN',
            marketCap: 17647,
            timeRem: '01h',
        },
        {
            ticker: 'WIF',
            marketCap: 5782,
            timeRem: '10h',
        },
        {
            ticker: 'TRUMP',
            marketCap: 22058,
            timeRem: '07h',
        },
        {
            ticker: 'DEGEN',
            marketCap: 5782,
            timeRem: '05h',
        },
        {
            ticker: 'LOCKIN',
            marketCap: 27573,
            timeRem: '05m',
        },
    ];

    const sorted: sortedAuctions = useSortedAuctions(rawData);

    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

    false && sorted;
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
                            <SearchableTicker
                                title='Auctions'
                                setIsFullLayoutActive={setIsFullLayoutActive}
                            />
                            <div className={styles.consoleChartComponent}>
                                <ConsoleComponent />
                                <span />
                                <Chart />
                            </div>
                        </div>
                    ) : (
                        <SearchableTicker
                            title='Auctions'
                            setIsFullLayoutActive={setIsFullLayoutActive}
                        />
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
            <SearchableTicker />
        </div>
    );
}

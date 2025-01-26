import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AuctionDataIF, diffHashSig } from '../../../ambient-utils/dataLayer';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { FutaSearchableTickerContext } from '../../../contexts/Futa/FutaSearchableTickerContext';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../pages/platformFuta/Auctions/useSortedAuctions';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

// import Divider from '../Divider/FutaDivider';
import { auctionDataSets } from '../../../pages/platformFuta/Account/Account';
import styles from './SearchableTicker.module.css';

import useDeviceDetection from '../../../utils/hooks/useDeviceDetection';
import ResizeableTableHeader from '../ResizeableTable/ResizeableTableHeader/ResizeableTableHeader';
import Typewriter from '../TypeWriter/TypeWriter';
import { GoChevronRight } from 'react-icons/go';
import TickerItem from './TickerItem';

interface propsIF {
    auctions: sortedAuctionsIF;
    dataState?: {
        active: auctionDataSets;
        toggle: (set?: auctionDataSets) => void;
    };
    isAccount?: boolean;
    placeholderTicker?: boolean | undefined;
}

export default function SearchableTicker(props: propsIF) {
    const { auctions, placeholderTicker, isAccount, dataState } = props;

    const {
        hoveredTicker,
        setSelectedTicker,
        selectedTicker,
        setHoveredTicker,

        showComplete,
        setShowComplete,
        watchlists,
        setFilteredAuctionList,
    } = useContext(AuctionsContext);

    const { searchableTickerHeights, setSearchableTickerHeight } = useContext(
        FutaSearchableTickerContext,
    );

    const tickerTableRef = useRef<HTMLDivElement>(null);
    // logic to expand table to full height if no data is available, this
    // ... keeps the 'no data available' msg centered in the visual space,
    useEffect(() => {
        // declare a variable to hold new table height
        let heightToUse: number;
        // if data is available, use either the saved or default height
        if (auctions.data.length) {
            heightToUse =
                searchableTickerHeights.saved ??
                searchableTickerHeights.default;
        } else {
            heightToUse = searchableTickerHeights.max;
        }
        // update state with new value
        setSearchableTickerHeight(heightToUse);
        // !important:  dependency array must be in the form val === 0,
        // !important:  ... this logic should only apply in situations
        // !important:  ... with no data or missing data, not when state
        // !important:  ... adds additional data to what we already have
    }, [auctions.data.length === 0]);

    // scrolling is disabled when hover on table
    const [isMouseEnter, setIsMouseEnter] = useState(false);

    const deviceType = useDeviceDetection();
    console.log(deviceType);

    const isMobile = useMediaQuery('(max-width: 768px)');

    // shape of data to create filter dropdown menu options
    interface filterOptionIF {
        label: string;
        value: string;
        slug: auctionSorts;
        default: 'asc' | 'desc';
    }

    const sortDropdownOptions: filterOptionIF[] = [
        {
            label: 'Time Remaining',
            value: 'Time Remaining',
            slug: 'timeLeft',
            default: 'asc',
        },
        {
            label: 'Market Cap',
            value: 'Market Cap',
            slug: 'marketCap',
            default: 'desc',
        },
    ];

    // current sort being applied to display to user
    const [activeSortOption, setActiveSortOption] = useState<filterOptionIF>(
        sortDropdownOptions[0],
    );

    // variable to hold user search input from the DOM
    const [searchInputRaw, setSearchInputRaw] = useState<string>('');

    // split auction data into complete vs incomplete subsets
    // runs any time new data is received by the components
    const [incompleteAuctions, completeAuctions] = useMemo<
        [AuctionDataIF[], AuctionDataIF[]]
    >(() => {
        // declare output variables
        const complete: AuctionDataIF[] = [];
        const incomplete: AuctionDataIF[] = [];
        // function to push an auction into the relevant output variables
        function categorize(a: AuctionDataIF): void {
            const isComplete: boolean =
                a.createdAt <= (Date.now() - a.auctionLength * 1000) / 1000;
            isComplete ? complete.push(a) : incomplete.push(a);
        }
        // iterate over auction data to split into complete vs incomplete subsets
        auctions.data.forEach((auction: AuctionDataIF) => categorize(auction));
        // return output variables
        return [incomplete, complete];
        // remove completed auctions from incomplete auctions list every 5 seconds
    }, [auctions.data, Math.floor(Date.now() / 1000 / 5)]);

    // auto switch to complete auctions if user only has complete auctions
    useEffect(() => {
        if (!incompleteAuctions.length && completeAuctions.length) {
            setShowComplete(true);
        }
    }, [incompleteAuctions.length, completeAuctions.length]);

    // choose data set to display and apply post-processing middleware
    const filteredData = useMemo<AuctionDataIF[]>(() => {
        // show the relevant data subset (complete vs incomplete)
        const dataSubset: AuctionDataIF[] = showComplete
            ? completeAuctions
            : incompleteAuctions;
        // filter data subset by search input from user
        const searchHits: AuctionDataIF[] = dataSubset.filter(
            (auc: AuctionDataIF) =>
                auc.ticker.includes(searchInputRaw.toUpperCase()),
        );
        // declare an output variable
        let output: AuctionDataIF[] = searchHits;
        // filter data set to watchlisted tokens
        if (!isAccount) {
            const watchlisted: AuctionDataIF[] = searchHits.filter(
                (auc: AuctionDataIF) =>
                    watchlists.shouldDisplay
                        ? watchlists.v1.data.includes(auc.ticker.toUpperCase())
                        : true,
            );
            // return auctions from correct subset matching user search input
            output =
                activeSortOption.label === 'timeRemaining'
                    ? watchlisted.reverse()
                    : watchlisted;
        }
        return output;
    }, [
        searchInputRaw,
        incompleteAuctions,
        completeAuctions,
        showComplete,
        watchlists.v1,
        watchlists.shouldDisplay,
    ]);

    useEffect(() => {
        if (placeholderTicker) setSelectedTicker(undefined);
    }, [placeholderTicker]);

    useEffect(() => {
        setFilteredAuctionList(filteredData);
    }, [diffHashSig(filteredData)]);

    const tickerItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (
            hoveredTicker &&
            tickerItemRefs.current[hoveredTicker] &&
            !isMouseEnter
        ) {
            const itemRef = tickerItemRefs.current[hoveredTicker];
            const tableRef = tickerTableRef.current;
            const localContainerRef = containerRef.current;

            if (itemRef && tableRef && localContainerRef) {
                tickerTableRef.current.scrollTo({
                    top: itemRef.offsetTop - localContainerRef.offsetTop,
                    behavior: 'smooth',
                });
            }
        }
    }, [hoveredTicker, isMouseEnter]);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        let isScrolling: NodeJS.Timeout;

        const handleScroll = () => {
            if (container) {
                container.classList.add(styles.scrolling);

                // Clear the timeout throughout the scroll
                window.clearTimeout(isScrolling);

                // Set a timeout to run after scrolling ends
                isScrolling = setTimeout(() => {
                    container.classList.remove(styles.scrolling);
                }, 1000);
            }
        };

        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const noAuctionsContent = (
        <div className={styles.no_auctions_content}>
            <Typewriter
                text={
                    watchlists.shouldDisplay
                        ? 'No tickers found in your watchlist'
                        : 'No tickers to display'
                }
            />
            {watchlists.shouldDisplay && <p>Consider viewing all tickers</p>}
            {watchlists.shouldDisplay && (
                <button onClick={() => watchlists.toggle()}>
                    View all tickers
                </button>
            )}
        </div>
    );
    const orderedData =
        showComplete && auctions.active === 'timeLeft'
            ? [...filteredData].reverse()
            : [...filteredData];

    const searchableContent = (
        <div className={styles.ticker_table} ref={tickerTableRef}>
            {filteredData.length ? (
                <header>
                    <p className={styles.cell_left}>
                        {
                            // this icon is a stupid but effective way
                            // ... way to keep the header text aligned
                            // ... with the content below
                        }
                        {isMobile || (
                            <GoChevronRight
                                size={20}
                                className={styles.ticker_col_header_spacer}
                            />
                        )}
                        TICKER
                    </p>
                    <p className={styles.cell_right}>MARKET CAP</p>
                    <p className={styles.cell_center}>STATUS</p>
                    <p className={styles.cell_right}>TIME</p>
                    {dataState?.active === 'created' && (
                        <p className={styles.cell_right}>ETH Committed</p>
                    )}
                    {dataState?.active === 'created' && (
                        <p className={styles.cell_right}>ETH Rewards</p>
                    )}
                </header>
            ) : null}
            <motion.div
                className={styles.ticker_table_content}
                onMouseEnter={() => setIsMouseEnter(true)}
                onMouseLeave={() => {
                    setIsMouseEnter(false);
                    setHoveredTicker(undefined);
                }}
                ref={containerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                {filteredData.length
                    ? orderedData.map((auction: AuctionDataIF) => (
                          <TickerItem
                              key={JSON.stringify(auction)}
                              auction={auction}
                              isAccount={isAccount}
                              isMobile={isMobile}
                              selectedTicker={selectedTicker}
                              setSelectedTicker={setSelectedTicker}
                              setShowComplete={setShowComplete}
                              useRefTicker={tickerItemRefs}
                              isCreated={dataState?.active === 'created'}
                          />
                      ))
                    : noAuctionsContent}
            </motion.div>
        </div>
    );

    return (
        <FlexContainer flexDirection='column' fullHeight fullWidth>
            <ResizeableTableHeader
                auctions={auctions}
                dataState={dataState}
                searchInputRaw={searchInputRaw}
                setSearchInputRaw={setSearchInputRaw}
                filteredData={filteredData}
                activeSortOption={activeSortOption}
                setActiveSortOption={setActiveSortOption}
            />
            {searchableContent}
        </FlexContainer>
    );
}

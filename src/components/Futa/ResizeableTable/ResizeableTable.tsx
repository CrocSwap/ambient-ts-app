import { NumberSize, Resizable } from 're-resizable';
import { Direction } from 're-resizable/lib/resizer';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { useContext, useRef } from 'react';
import { FutaSearchableTickerContext } from '../../../contexts/Futa/FutaSearchableTickerContext';
import styles from './ResizeableTable.module.css';
import ResizeableTableHeader from './ResizeableTableHeader/ResizeableTableHeader';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../pages/platformFuta/Auctions/useSortedAuctions';
import { auctionDataSets } from '../../../pages/platformFuta/Account/Account';
import { GoChevronRight } from 'react-icons/go';
import { AuctionDataIF } from '../../../ambient-utils/dataLayer';
import TickerItem from '../SearchableTicker/TickerItem';
import { AuctionsContext } from '../../../contexts';
import Typewriter from '../TypeWriter/TypeWriter';

interface filterOptionIF {
    label: string;
    value: string;
    slug: auctionSorts;
    default: 'asc' | 'desc';
}
interface propsIF {
    auctions: sortedAuctionsIF;
    dataState?: {
        active: auctionDataSets;
        toggle: (set?: auctionDataSets) => void;
    };
    isAccount?: boolean;
    placeholderTicker?: boolean | undefined;
    filteredData: AuctionDataIF[];
    setIsMouseEnter: React.Dispatch<React.SetStateAction<boolean>>;
    isMouseEnter: boolean;
    containerRef: React.RefObject<HTMLDivElement>;
    tickerItemRefs: React.MutableRefObject<{
        [key: string]: HTMLDivElement | null;
    }>;
    searchInputRaw: string;
    setSearchInputRaw: React.Dispatch<React.SetStateAction<string>>;
    activeSortOption: filterOptionIF;
    setActiveSortOption: React.Dispatch<React.SetStateAction<filterOptionIF>>;
}
export default function ResizeableTable(props: propsIF) {
    const {
        isAccount,
        auctions,
        dataState,
        filteredData,
        setIsMouseEnter,
        containerRef,
        tickerItemRefs,
        searchInputRaw,
        setSearchInputRaw,
        activeSortOption,
        setActiveSortOption,
    } = props;
    const {
        selectedTicker,
        setSelectedTicker,
        setHoveredTicker,
        showComplete,
        setShowComplete,
        watchlists,
    } = useContext(AuctionsContext);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 769px) and (max-width: 1024px)',
    );

    const {
        searchableTickerHeights,
        setSearchableTickerHeight,
        setIsSearchableTickerHeightMinimum,
    } = useContext(FutaSearchableTickerContext);

    const tableParentRef = useRef<HTMLDivElement>(null);
    const tickerTableRef = useRef<HTMLDivElement>(null);

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
            <div
                className={styles.ticker_table_content}
                onMouseEnter={() => setIsMouseEnter(true)}
                onMouseLeave={() => {
                    setIsMouseEnter(false);
                    setHoveredTicker(undefined);
                }}
                ref={containerRef}
            >
                {filteredData.length
                    ? (showComplete && auctions.active === 'timeLeft'
                          ? [...filteredData].reverse()
                          : [...filteredData]
                      ).map((auction: AuctionDataIF) => (
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
            </div>
        </div>
    );
    return (
        <Resizable
            enable={{
                bottom: !isAccount,
                top: false,
                left: false,
                topLeft: false,
                bottomLeft: false,
                right: false,
                topRight: false,
                bottomRight: false,
            }}
            size={{
                height:
                    !isMobile || isTabletScreen
                        ? isAccount && tableParentRef.current
                            ? !isMobile
                                ? tableParentRef.current.getBoundingClientRect()
                                      .height * 0.99
                                : '90%'
                            : searchableTickerHeights.current
                        : '90%',
            }}
            minHeight={200}
            maxHeight={
                isAccount || (isMobile && !isTabletScreen)
                    ? undefined
                    : window.innerHeight - 200
            }
            onResize={(
                evt: MouseEvent | TouchEvent,
                dir: Direction,
                ref: HTMLElement,
                d: NumberSize,
            ) => {
                const newHeight = searchableTickerHeights.current + d.height;
                if (newHeight <= searchableTickerHeights.min) {
                    setIsSearchableTickerHeightMinimum(true);
                } else {
                    setIsSearchableTickerHeightMinimum(false);
                }
            }}
            onResizeStart={() => {
                /* may be useful later */
            }}
            onResizeStop={(
                evt: MouseEvent | TouchEvent,
                dir: Direction,
                ref: HTMLElement,
                d: NumberSize,
            ) => {
                const newHeight = Math.max(
                    searchableTickerHeights.min,
                    Math.min(
                        searchableTickerHeights.current + d.height,
                        searchableTickerHeights.max,
                    ),
                );

                setSearchableTickerHeight(newHeight);
            }}
            bounds={'parent'}
            className={styles.resizable}
            style={{ borderBottom: 'none !important' }}
        >
            {/* {headerDisplay} */}
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
        </Resizable>
    );
}

import { NumberSize, Resizable } from 're-resizable';
import { Direction } from 're-resizable/lib/resizer';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { FaEye } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { MdClose } from 'react-icons/md';
import { AuctionDataIF, diffHashSig } from '../../../ambient-utils/dataLayer';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { FutaSearchableTickerContext } from '../../../contexts/Futa/FutaSearchableTickerContext';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../pages/platformFuta/Auctions/useSortedAuctions';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import AuctionLoader from '../AuctionLoader/AuctionLoader';
import Chart from '../Chart/Chart';
// import Divider from '../Divider/FutaDivider';
import Typewriter from '../TypeWriter/TypeWriter';
import styles from './SearchableTicker.module.css';
import TickerItem from './TickerItem';
import { auctionDataSets } from '../../../pages/platformFuta/Account/Account';
import { LuCheck, LuPencil } from 'react-icons/lu';

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
        setIsLoading,
        selectedTicker,
        hoveredTicker,
        setSelectedTicker,
        setHoveredTicker,
        showComplete,
        setShowComplete,
        watchlists,
        setFilteredAuctionList,
    } = useContext(AuctionsContext);

    const {
        searchableTickerHeights,
        setSearchableTickerHeight,
        canvasRef,
        setIsSearchableTickerHeightMinimum,
        isFullScreen,
    } = useContext(FutaSearchableTickerContext);

    const tableParentRef = useRef<HTMLDivElement>(null);

    // logic to expand table to full height if no data is available, this
    // ... keeps the 'no data available' msg centered in the visual space,
    useEffect(() => {
        console.log(tableParentRef.current);
        // declare a variable to hold new table height
        let heightToUse: number;
        // if data is available, use either the saved or default height
        if (tableParentRef.current && isFullScreen) {
            const val = tableParentRef.current.getBoundingClientRect().height;
            console.log(val);
            heightToUse = val;
        } else if (auctions.data.length) {
            heightToUse =
                searchableTickerHeights.saved ??
                searchableTickerHeights.default;
        } else {
            heightToUse = searchableTickerHeights.max;
        }
        // update state with new value
        console.log(heightToUse);
        setSearchableTickerHeight(heightToUse);
        // !important:  dependency array must be in the form val === 0,
        // !important:  ... this logic should only apply in situations
        // !important:  ... with no data or missing data, not when state
        // !important:  ... adds additional data to what we already have
    }, [auctions.data.length === 0, tableParentRef.current]);

    const [isSortDropdownOpen, setIsSortDropdownOpen] =
        useState<boolean>(false);
    // scrolling is disabled when hover on table
    const [isMouseEnter, setIsMouseEnter] = useState(false);
    const customLoading = false;

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

    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

    // variable to hold user search input from the DOM
    const [searchInputRaw, setSearchInputRaw] = useState<string>('');

    // fn to clear search input and re-focus the input element
    function clearInput(): void {
        setSearchInputRaw('');
        focusInput();
    }

    function focusInput(): void {
        document.getElementById(INPUT_DOM_ID)?.focus();
    }

    // clear search input on ESC keypress
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent): void => {
            if (document.activeElement?.id === INPUT_DOM_ID) {
                e.code === 'Escape' && clearInput();
            }
        };
        document.body.addEventListener('keydown', handleEscape);
        return function cleanUp() {
            document.body.removeEventListener('keydown', handleEscape);
        };
    });

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
        const dataSubset: AuctionDataIF[] =
            showComplete && !isAccount ? completeAuctions : incompleteAuctions;
        // filter data subset by search input from user
        const searchHits: AuctionDataIF[] = dataSubset.filter(
            (auc: AuctionDataIF) =>
                auc.ticker.includes(searchInputRaw.toUpperCase()),
        );
        // filter data set to watchlisted tokens
        const watchlisted: AuctionDataIF[] = searchHits.filter(
            (auc: AuctionDataIF) =>
                watchlists.shouldDisplay
                    ? watchlists.v1.data.includes(auc.ticker.toUpperCase())
                    : true,
        );
        // return auctions from correct subset matching user search input
        return activeSortOption.label === 'timeRemaining'
            ? watchlisted.reverse()
            : watchlisted;
    }, [
        searchInputRaw,
        incompleteAuctions,
        completeAuctions,
        showComplete,
        watchlists.v1,
        watchlists.shouldDisplay,
    ]);

    const timeDropdownRef = useRef<HTMLDivElement>(null);

    // fn to close the sort filter menu when user clicks outside
    const clickOutsideHandler = (): void => {
        setIsSortDropdownOpen(false);
    };

    // hook to handle user click outside of the dropdown modal
    useOnClickOutside(timeDropdownRef, clickOutsideHandler);

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
            // tickerItemRefs.current[hoveredTicker]?.scrollIntoView({
            //     behavior: 'smooth',
            // });
            const itemRef = tickerItemRefs.current[hoveredTicker];
            if (itemRef && containerRef.current) {
                containerRef.current.scrollTo({
                    top: itemRef.offsetTop,
                    behavior: 'smooth',
                });
            }
        }
    }, [hoveredTicker, isMouseEnter]);

    // @Junior: do we still need this? `customLoading` is hardcoded to `false`
    // @Junior: ... so this isn't actually being consumed by the app
    if (customLoading) return <AuctionLoader setIsLoading={setIsLoading} />;

    // fn to determine directionality sort arrows should indicate
    function getArrowDirection(): 'up' | 'down' | null {
        let output: 'up' | 'down' | null = null;
        if (auctions.active === 'marketCap') {
            output = auctions.isReversed ? 'up' : 'down';
        } else if (auctions.active === 'timeLeft') {
            output = auctions.isReversed ? 'down' : 'up';
        }
        return output;
    }

    // apply a consistent size to all icons inside buttons
    const BUTTON_ICON_SIZE = 17;

    const smallScreen: boolean = useMediaQuery('(max-width: 400px)');

    const headerDisplay = (
        <div className={styles.header}>
            <div className={styles.search_and_sort}>
                <div className={styles.text_search_box}>
                    <BiSearch
                        size={20}
                        color='var(--text2)'
                        id='searchable_ticker_input'
                        onClick={() => focusInput()}
                    />
                    <input
                        type='text'
                        id={INPUT_DOM_ID}
                        value={searchInputRaw}
                        onChange={(e) => setSearchInputRaw(e.target.value)}
                        placeholder='SEARCH...'
                        spellCheck={false}
                        autoComplete='off'
                        tabIndex={1}
                    />
                    {searchInputRaw && (
                        <MdClose
                            size={20}
                            color='var(--text2)'
                            onClick={() => clearInput()}
                        />
                    )}
                </div>
                <div className={styles.sort_clickable} ref={timeDropdownRef}>
                    <div className={styles.sort_selection}>
                        <div
                            className={styles.timeDropdownButton}
                            onClick={() =>
                                setIsSortDropdownOpen(!isSortDropdownOpen)
                            }
                        >
                            <p>{activeSortOption.label}</p>
                            {isSortDropdownOpen ? (
                                <IoIosArrowUp color='var(--accent1)' />
                            ) : (
                                <IoIosArrowDown color='var(--accent1)' />
                            )}
                        </div>
                        <div
                            className={styles.sort_direction}
                            onClick={() => auctions.reverse()}
                        >
                            <IoIosArrowUp
                                size={14}
                                color={
                                    getArrowDirection() === 'up'
                                        ? 'var(--accent1)'
                                        : ''
                                }
                            />

                            <IoIosArrowDown
                                size={14}
                                color={
                                    getArrowDirection() === 'down'
                                        ? 'var(--accent1)'
                                        : ''
                                }
                            />
                        </div>
                    </div>
                    {isSortDropdownOpen && (
                        <div className={styles.dropdown}>
                            {sortDropdownOptions.map((item, idx) => (
                                <p
                                    className={styles.timeItem}
                                    key={idx}
                                    onClick={() => {
                                        setActiveSortOption(item);
                                        setIsSortDropdownOpen(false);
                                        auctions.update(
                                            item.slug as auctionSorts,
                                        );
                                    }}
                                >
                                    {item.label}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.filters}>
                <button
                    onClick={() => setShowComplete(!showComplete)}
                    className={styles[showComplete ? 'button_on' : '']}
                >
                    <LuCheck size={BUTTON_ICON_SIZE} />
                    <div>COMPLETED</div>
                </button>

                {isAccount || (
                    <button
                        onClick={() => watchlists.toggle()}
                        className={[
                            styles[watchlists.shouldDisplay ? 'button_on' : ''],
                            styles.foo,
                        ].join(' ')}
                    >
                        <FaEye size={BUTTON_ICON_SIZE} />
                        <div>WATCHLIST</div>
                    </button>
                )}
                {isAccount ? (
                    <button
                        className={
                            styles[
                                dataState?.active === 'created'
                                    ? 'button_on'
                                    : ''
                            ]
                        }
                        onClick={() => dataState?.toggle && dataState.toggle()}
                    >
                        <LuPencil size={BUTTON_ICON_SIZE} />
                        <div>CREATED</div>
                    </button>
                ) : null}
            </div>
        </div>
    );

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

    const searchableContent = (
        <div className={styles.ticker_table}>
            {filteredData.length ? (
                <header>
                    <p>TICKER</p>
                    <p
                    // className={styles.marketCapHeader}
                    >
                        MARKET CAP
                    </p>
                    <p>STATUS</p>
                    <p>TIME</p>
                    {dataState?.active === 'created' && <p>ETH Committed</p>}
                    {dataState?.active === 'created' && <p>ETH Rewards</p>}
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
                              isMobile={smallScreen}
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

    const resizableChart = (
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
                    isAccount && tableParentRef.current
                        ? tableParentRef.current.getBoundingClientRect()
                              .height * 0.99
                        : searchableTickerHeights.current,
            }}
            minHeight={200}
            maxHeight={isAccount ? undefined : window.innerHeight - 200}
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
            className={styles.resi}
            style={{ borderBottom: 'none !important' }}
        >
            {headerDisplay}
            {searchableContent}
        </Resizable>
    );

    return (
        <div
            className={styles.container}
            style={{
                gridTemplateRows: isAccount ? 'auto 100%' : '',
            }}
            ref={canvasRef}
        >
            <FlexContainer
                flexDirection='column'
                fullHeight
                className={styles.contentContainer}
                ref={tableParentRef}
            >
                {resizableChart}
                {!isAccount && !isMobile && <Chart />}
            </FlexContainer>
        </div>
    );
}

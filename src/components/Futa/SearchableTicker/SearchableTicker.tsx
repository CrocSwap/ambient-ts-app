import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import TickerItem from './TickerItem';
import { MdClose } from 'react-icons/md';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { BiSearch } from 'react-icons/bi';
import styles from './SearchableTicker.module.css';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Divider from '../Divider/Divider';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import AuctionLoader from '../AuctionLoader/AuctionLoader';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../pages/platformFuta/Auctions/useSortedAuctions';
import { FaEye } from 'react-icons/fa';
import { AuctionDataIF } from '../../../ambient-utils/dataLayer';
import Chart from '../Chart/Chart';

interface propsIF {
    auctions: sortedAuctionsIF;
    title?: string;
    setIsFullLayoutActive?: Dispatch<SetStateAction<boolean>>;
    isAccount?: boolean;
    placeholderTicker?: boolean | undefined;
}

export default function SearchableTicker(props: propsIF) {
    const {
        auctions,
        title,
        setIsFullLayoutActive,
        placeholderTicker,
        isAccount,
    } = props;
    const [isSortDropdownOpen, setIsSortDropdownOpen] =
        useState<boolean>(false);
    // scrolling is disabled when hover on table
    const [isMouseEnter, setIsMouseEnter] = useState(false);
    const customLoading = false;

    const {
        setIsLoading,
        selectedTicker,
        hoveredTicker,
        setSelectedTicker,
        setHoveredTicker,
        showComplete,
        setShowComplete,
        watchlists,
    } = useContext(AuctionsContext);

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
        const dataSubset: AuctionDataIF[] = showComplete
            ? completeAuctions
            : incompleteAuctions;
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

    const tickerItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (
            hoveredTicker &&
            tickerItemRefs.current[hoveredTicker] &&
            !isMouseEnter
        ) {
            tickerItemRefs.current[hoveredTicker]?.scrollIntoView({
                behavior: 'smooth',
            });
        }
    }, [hoveredTicker, isMouseEnter]);

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

    const headerDisplay = (
        <div className={styles.header}>
            <Divider count={2} />
            {title && (
                <h3
                    className={styles.title}
                    onClick={
                        setIsFullLayoutActive
                            ? () => setIsFullLayoutActive((prev) => !prev)
                            : () => null
                    }
                >
                    {title}
                </h3>
            )}
            <div className={styles.filter_options}>
                <div className={styles.search_and_filter}>
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
                    <div className={styles.filters} ref={timeDropdownRef}>
                        <div className={styles.timeDropdownContent}>
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
                <div className={styles.sort_toggles}>
                    <button
                        onClick={() => setShowComplete(!showComplete)}
                        className={
                            showComplete ? styles.buttonOn : styles.buttonOff
                        }
                    >
                        SHOW COMPLETE
                    </button>
                    <button
                        onClick={() => watchlists.toggle()}
                        className={
                            styles[
                                watchlists.shouldDisplay
                                    ? 'buttonOn'
                                    : 'buttonOff'
                            ]
                        }
                    >
                        <FaEye
                            size={17}
                            className={
                                styles[
                                    watchlists.shouldDisplay
                                        ? 'eyeOn'
                                        : 'eyeOff'
                                ]
                            }
                        />
                        WATCHLIST
                    </button>
                </div>
            </div>
        </div>
    );
    const fullScreenTable = false;
    return (
        <div
            className={styles.container}
            style={{
                gridTemplateRows:
                    fullScreenTable || isAccount ? 'auto 100%' : 'auto 70% 30%',
            }}
        >
            {headerDisplay}

            <div className={styles.tickerTableContainer}>
                <header className={styles.tickerHeader}>
                    <p>TICKER</p>
                    <p className={styles.marketCapHeader}>MARKET CAP</p>
                    <p>REMAINING</p>
                    <div className={styles.statusContainer}>
                        {/* <span /> */}
                    </div>
                </header>
                <div
                    className={styles.tickerTableContent}
                    onMouseEnter={() => setIsMouseEnter(true)}
                    onMouseLeave={() => {
                        setIsMouseEnter(false);
                        setHoveredTicker(undefined);
                    }}
                >
                    {(showComplete && auctions.active === 'timeLeft'
                        ? [...filteredData].reverse()
                        : [...filteredData]
                    ).map((auction: AuctionDataIF) => (
                        <TickerItem
                            key={JSON.stringify(auction)}
                            auction={auction}
                            isAccount={isAccount}
                            selectedTicker={selectedTicker}
                            setSelectedTicker={setSelectedTicker}
                            setShowComplete={setShowComplete}
                            useRefTicker={tickerItemRefs}
                        />
                    ))}
                </div>
            </div>
            {!fullScreenTable && !isAccount && <Chart />}
        </div>
    );
}

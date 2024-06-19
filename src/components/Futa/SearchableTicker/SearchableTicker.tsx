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
import {
    AuctionDataIF,
    AuctionsContext,
} from '../../../contexts/AuctionsContext';
import AuctionLoader from '../AuctionLoader/AuctionLoader';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../pages/platformFuta/Auctions/useSortedAuctions';

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
        isAccount,
        placeholderTicker,
    } = props;
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] =
        useState<boolean>(false);
    const [showComplete, setShowComplete] = useState<boolean>(false);
    const customLoading = false;
    const { setIsLoading } = useContext(AuctionsContext);
    const [selectedTicker, setSelectedTicker] =
        useState<AuctionDataIF | null>();

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

    const filteredData = useMemo<AuctionDataIF[]>(() => {
        const dataFilteredBySearch = auctions.data.filter(
            (auc: AuctionDataIF) =>
                auc.ticker.includes(searchInputRaw.toUpperCase()),
        );
        const filteredByCompletion =
            !isAccount || showComplete
                ? dataFilteredBySearch.filter((auction: AuctionDataIF) =>
                      // show auctions that are more than 1 week old if showComplete is true
                      showComplete
                          ? auction.createdAt < (Date.now() - 604800000) / 1000
                          : auction.createdAt > (Date.now() - 604800000) / 1000,
                  )
                : dataFilteredBySearch;
        return filteredByCompletion;
    }, [searchInputRaw, auctions.data, isAccount, showComplete]);

    const timeDropdownRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setIsTimeDropdownOpen(false);
    };
    useOnClickOutside(timeDropdownRef, clickOutsideHandler);

    const creationTimeData = [
        { label: 'Creation Time', value: 'Creation Time', slug: 'createdAt' },
        { label: 'Market Cap', value: 'Market Cap', slug: 'marketCap' },
    ];

    const [activeTime, setActiveTime] = useState(creationTimeData[0]);
    useEffect(() => {
        if (placeholderTicker) setSelectedTicker(null);
    }, [placeholderTicker]);

    if (customLoading) return <AuctionLoader setIsLoading={setIsLoading} />;

    return (
        <div className={styles.container}>
            <Divider count={2} />
            <div className={styles.header}>
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
                        <MdClose
                            size={20}
                            color='var(--text2)'
                            onClick={() => clearInput()}
                        />{' '}
                    </div>
                    <div className={styles.sort_toggles}>
                        <div className={styles.timeDropdownLeft}>
                            <div className={styles.timeDropdownContent}>
                                <div
                                    className={styles.timeDropdownButton}
                                    onClick={() =>
                                        setIsTimeDropdownOpen(
                                            !isTimeDropdownOpen,
                                        )
                                    }
                                >
                                    <p>{activeTime.label}</p>
                                    {isTimeDropdownOpen ? (
                                        <IoIosArrowUp />
                                    ) : (
                                        <IoIosArrowDown color='var(--text1)' />
                                    )}
                                </div>

                                <div
                                    className={styles.sortOptions}
                                    onClick={() => auctions.reverse()}
                                >
                                    <IoIosArrowUp
                                        size={14}
                                        color={
                                            auctions.isReversed
                                                ? 'var(--accent1)'
                                                : ''
                                        }
                                    />

                                    <IoIosArrowDown
                                        size={14}
                                        color={
                                            !auctions.isReversed
                                                ? 'var(--accent1)'
                                                : ''
                                        }
                                    />
                                </div>
                            </div>

                            {isTimeDropdownOpen && (
                                <div
                                    className={styles.dropdown}
                                    ref={timeDropdownRef}
                                >
                                    {creationTimeData.map((item, idx) => (
                                        <p
                                            className={styles.timeItem}
                                            key={idx}
                                            onClick={() => {
                                                setActiveTime(item);
                                                setIsTimeDropdownOpen(false);
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
                        {
                            <div className={styles.timeDropdownRight}>
                                <button
                                    onClick={() =>
                                        setShowComplete(!showComplete)
                                    }
                                    className={
                                        showComplete
                                            ? styles.buttonOn
                                            : styles.buttonOff
                                    }
                                >
                                    SHOW COMPLETE
                                </button>
                                <button className={styles.buttonOff}>
                                    WATCHLIST
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className={styles.tickerTableContainer}>
                <header className={styles.tickerHeader}>
                    <p>TICKER</p>
                    <p className={styles.marketCapHeader}>MARKET CAP</p>
                    <p>REMAINING</p>
                    <div className={styles.statusContainer}>
                        <span />
                    </div>
                </header>
                <div className={styles.tickerTableContent}>
                    {filteredData.map((auction: AuctionDataIF) => (
                        <TickerItem
                            key={JSON.stringify(auction)}
                            auction={auction}
                            selectedTicker={selectedTicker}
                            setSelectedTicker={setSelectedTicker}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

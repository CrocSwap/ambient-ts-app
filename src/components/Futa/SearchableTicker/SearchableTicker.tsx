import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import TickerItem from './TickerItem';
import { MdClose } from 'react-icons/md';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { BiSearch } from 'react-icons/bi';
import styles from './SearchableTicker.module.css';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Divider from '../Divider/Divider';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import AuctionLoader from '../AuctionLoader/AuctionLoader';
import { sortedAuctionsIF } from '../../../pages/platformFuta/Auctions/useSortedAuctions';
import { auctionDataIF } from '../../../pages/platformFuta/mockAuctionData';

interface propsIF {
    auctions: sortedAuctionsIF;
    title?: string;
    setIsFullLayoutActive?: Dispatch<SetStateAction<boolean>>;
}

export default function SearchableTicker(props: propsIF) {
    const { auctions, title, setIsFullLayoutActive } = props;
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] =
        useState<boolean>(false);
    const [showComplete, setShowComplete] = useState<boolean>(false);
    const [currentOrder, setCurrentOrder] = useState<'ASC' | 'DSC'>('ASC');
    const customLoading = false;
    const { setIsLoading } = useContext(AuctionsContext);
    useEffect(() => console.log(showComplete), [showComplete]);
    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

    // variable to hold user search input from the DOM
    const [searchInput, setSearchInput] = useState<string>('');

    // fn to clear search input and re-focus the input element
    function clearInput(): void {
        setSearchInput('');
        document.getElementById(INPUT_DOM_ID)?.focus();
    }

    const toggleOrder = () => {
        setCurrentOrder((prevOrder) => (prevOrder === 'ASC' ? 'DSC' : 'ASC'));
    };

    const timeDropdownRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setIsTimeDropdownOpen(false);
    };
    useOnClickOutside(timeDropdownRef, clickOutsideHandler);

    const searchContainer = (
        <div className={styles.searchContainer}>
            <BiSearch
                size={20}
                color='var(--text2)'
                id='searchable_ticker_input'
            />
            <input
                className={styles.searchInput}
                type='text'
                id={INPUT_DOM_ID}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
    );
    const creationTimeData = [
        { label: 'Creation Time', value: 'Creation Time' },
        { label: 'Market Cap', value: 'Market Cap' },
        { label: 'Last Bid', value: 'Last Bid' },
        { label: 'Last Reply', value: 'Last Reply' },
    ];

    const [activeTime, setActiveTime] = useState(creationTimeData[0]);

    // const tickerData = [
    //     {
    //         ticker: 'PEPE',
    //         marketCap: '34,466',
    //         timeRem: '15h',
    //         status: null,
    //     },
    //     {
    //         ticker: 'BODEN',
    //         marketCap: '27,573',
    //         timeRem: '21h',
    //         status: 'var(--negative)',
    //     },
    //     {
    //         ticker: 'BOME',
    //         marketCap: '626,930',
    //         timeRem: '40m',
    //         status: 'null',
    //     },
    //     {
    //         ticker: 'BITCOIN',
    //         marketCap: '17,647',
    //         timeRem: '01h',
    //         status: 'var(--positive)',
    //     },
    //     {
    //         ticker: 'TRUMP',
    //         marketCap: '22,058',
    //         timeRem: '07h',
    //         status: null,
    //     },
    //     {
    //         ticker: 'LOCKIN',
    //         marketCap: '27,573',
    //         timeRem: '05m',
    //         status: 'null',
    //     },
    //     {
    //         ticker: 'NOT',
    //         marketCap: '783,663',
    //         timeRem: 'COMPLETE',
    //         status: 'var(--text1)',
    //     },
    //     {
    //         ticker: 'MOG',
    //         marketCap: '783,663',
    //         timeRem: 'COMPLETE',
    //         status: 'var(--text1)',
    //     },
    //     {
    //         ticker: 'MEW',
    //         marketCap: '14,117',
    //         timeRem: 'COMPLETE',
    //         status: 'var(--accent4)',
    //     },
    // ];

    // toggle inclusion of auctions that have closed
    // const [tickerDataToShow, setTickerDataToShow] = useState(
    //     tickerData.filter((item) => item.timeRem !== 'COMPLETE'),
    // );
    // const handleShowComplete = () => {
    //     setShowComplete(!showComplete);
    //     if (!showComplete) {
    //         setTickerDataToShow(
    //             tickerData.filter((item) => item.timeRem === 'COMPLETE'),
    //         );
    //     } else {
    //         setTickerDataToShow(
    //             tickerData.filter((item) => item.timeRem !== 'COMPLETE'),
    //         );
    //     }
    // };

    const timeDropdown = (
        <section className={styles.timeDropdownContainer}>
            <div className={styles.timeDropdownLeft}>
                <div className={styles.timeDropdownContent}>
                    <div
                        className={styles.timeDropdownButton}
                        onClick={() =>
                            setIsTimeDropdownOpen(!isTimeDropdownOpen)
                        }
                    >
                        <p>{activeTime.label}</p>
                        {isTimeDropdownOpen ? (
                            <IoIosArrowUp />
                        ) : (
                            <IoIosArrowDown color='var(--text1)' />
                        )}
                    </div>

                    <div className={styles.sortOptions} onClick={toggleOrder}>
                        <IoIosArrowUp
                            size={14}
                            color={
                                currentOrder === 'ASC' ? 'var(--accent1)' : ''
                            }
                        />

                        <IoIosArrowDown
                            size={14}
                            color={
                                currentOrder === 'DSC' ? 'var(--accent1)' : ''
                            }
                        />
                    </div>
                </div>

                {isTimeDropdownOpen && (
                    <div className={styles.dropdown} ref={timeDropdownRef}>
                        {creationTimeData.map((item, idx) => (
                            <p
                                className={styles.timeItem}
                                key={idx}
                                onClick={() => {
                                    setActiveTime(item),
                                        setIsTimeDropdownOpen(false);
                                }}
                            >
                                {item.label}
                            </p>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.timeDropdownRight}>
                <button
                    onClick={() => setShowComplete(!showComplete)}
                    className={
                        showComplete ? styles.buttonOn : styles.buttonOff
                    }
                >
                    SHOW COMPLETE
                </button>
            </div>
        </section>
    );

    const tickerTableDisplay = (
        <div className={styles.tickerTableContainer}>
            <header className={styles.tickerHeader}>
                <p>TICKER</p>
                <p>MARKET CAP</p>
                <p>REMAINING</p>
                <div className={styles.statusContainer}>
                    <span />
                </div>
            </header>
            <div className={styles.tickerTableContent}>
                {auctions.data
                    .filter((auction: auctionDataIF) =>
                        showComplete ? true : auction.timeRem !== 'COMPLETE',
                    )
                    .map((auction: auctionDataIF) => (
                        <TickerItem
                            key={JSON.stringify(auction)}
                            {...auction}
                        />
                    ))}
            </div>
        </div>
    );
    console.log({ title });

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
                <div className={styles.headerBottom}>
                    {searchContainer}
                    {timeDropdown}
                </div>
            </div>
            {tickerTableDisplay}
        </div>
    );
}

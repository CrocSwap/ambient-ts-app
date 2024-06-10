import styles from './Auctions.module.css';
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import AuctionItem from './AuctionItem';
import { useState } from 'react';

export interface auctionDataIF {
    ticker: string;
    marketCap: number;
    timeRem: string;
}

export default function Auctions() {
    // placeholder data until the platform has live data
    const data: auctionDataIF[] = [
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

    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

    // variable to hold user search input from the DOM
    const [searchInput, setSearchInput] = useState<string>('');

    // fn to clear search input and re-focus the input element
    function clearInput(): void {
        setSearchInput('');
        document.getElementById(INPUT_DOM_ID)?.focus();
    }

    const [showComplete, setShowComplete] = useState<boolean>(false);

    return (
        <div className={styles.auctions_main}>
            <h3>AUCTIONS</h3>
            <div className={styles.search_box}>
                <HiMiniMagnifyingGlass />
                <input
                    id={INPUT_DOM_ID}
                    type='text'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder='SEARCH...'
                    spellCheck={false}
                    autoComplete='off'
                />
                <button onClick={() => clearInput()}>×</button>
            </div>
            <div className={styles.sort_buttons}>
                <div>CREATION TIME</div>
                <button
                    className={
                        styles[showComplete ? 'button_on' : 'button_off']
                    }
                    onClick={() => setShowComplete(!showComplete)}
                >
                    SHOW COMPLETE
                </button>
            </div>
            <div className={styles.auctions_list}>
                <header>
                    <h5 className={styles.ticker_header}>TICKER</h5>
                    <h5 className={styles.market_cap_header}>MARKET CAP</h5>
                    <h5 className={styles.time_left_header}>REMAINING</h5>
                </header>
                <div className={styles.auctions_links}>
                    {data.map((d: auctionDataIF) => (
                        <AuctionItem key={JSON.stringify(d)} {...d} />
                    ))}
                </div>
            </div>
        </div>
    );
}

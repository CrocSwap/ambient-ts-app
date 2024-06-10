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
            timeRem: '05hr',
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

    const INPUT_DOM_ID = 'ticker_auction_search_input';

    const [searchInput, setSearchInput] = useState<string>('');
    function clearInput(): void {
        setSearchInput('');
        document.getElementById(INPUT_DOM_ID)?.focus();
    }

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
                    placeholder='Search...'
                    spellCheck={false}
                    autoComplete='off'
                />
                <button onClick={() => clearInput()}>×</button>
            </div>
            <div className={styles.sort_buttons}></div>
            <div className={styles.auctions_list}>
                <div className={styles.auction_headers}>
                    <h5>TICKER</h5>
                    <h5>Market Cap</h5>
                    <h5>REMAINING</h5>
                </div>
                <div className={styles.auctions_links}>
                    {data.map((d: auctionDataIF) => (
                        <AuctionItem key={JSON.stringify(d)} {...d} />
                    ))}
                </div>
            </div>
        </div>
    );
}

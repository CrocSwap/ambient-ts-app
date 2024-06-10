import { MdClose } from 'react-icons/md';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import styles from './Account.module.css';
import { BiSearch } from 'react-icons/bi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useState } from 'react';
import TickerItem from './TickerItem';
import TooltipComponent from '../../../components/Global/TooltipComponent/TooltipComponent';
export default function Account() {
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

    const searchContainer = (
        <div className={styles.searchContainer}>
            <BiSearch
                size={20}
                color='var(--text2)'

                // color={sidebar.isOpen ? 'var(--text2)' : 'var(--accent5)'}
                // onClick={focusInput}
            />
            <input
                className={styles.searchInput}
                type='text'
                // id={searchInputElementId}
                // value={searchData.rawInput}
                placeholder='Search...'
                // onChange={(e: ChangeEvent<HTMLInputElement>) =>
                //     searchData.setInput(e.target.value)
                // }
                // onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                //     if (e.code === 'Escape') {
                //         // prevent keypress from de-focusing the input
                //         e.stopPropagation();
                //         // clear search input, DOM will update
                //         searchData.clearInput();
                //     }
                // }}
                spellCheck='false'
                autoComplete='off'
                tabIndex={1}
            />
            <MdClose size={20} color='var(--text2)' />{' '}
        </div>
    );

    const creationTimeData = [
        { label: 'Creation Time', value: 'Creation Time' },
        { label: 'Market Cap', value: 'Market Cap' },
        { label: 'Last Bid', value: 'Last Bid' },
        { label: 'Last Reply', value: 'Last Reply' },
    ];

    const tickerData = [
        {
            ticker: 'PEPE',
            marketCap: '$34,466',
            remaining: '15h',
            status: null,
        },
        {
            ticker: 'BODEN',
            marketCap: '$27,573',
            remaining: '21h',
            status: 'var(--negative)',
        },
        {
            ticker: 'BOME',
            marketCap: '$626,930',
            remaining: '40m',
            status: 'null',
        },
        {
            ticker: 'BITCOIN',
            marketCap: '$17,647',
            remaining: '01h',
            status: 'var(--positive)',
        },
        {
            ticker: 'TRUMP',
            marketCap: '$22,058',
            remaining: '07h',
            status: null,
        },
        {
            ticker: 'LOCKIN',
            marketCap: '$27,573',
            remaining: '05m',
            status: 'null',
        },
        {
            ticker: 'NOT',
            marketCap: '$783,663',
            remaining: 'COMPLETE',
            status: 'var(--positive)',
        },
        {
            ticker: 'MOG',
            marketCap: '$783,663',
            remaining: 'COMPLETE',
            status: 'var(--negative)',
        },
        {
            ticker: 'MEW',
            marketCap: '$14,117',
            remaining: 'COMPLETE',
            status: 'var(--accent4)',
        },
    ];

    const timeDropdown = (
        <div className={styles.timeDropdownContainer}>
            <div className={styles.timeDropdownContent}>
                <div
                    className={styles.timeDropdownButton}
                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                >
                    <p>Creation Time</p>
                    {isTimeDropdownOpen ? (
                        <IoIosArrowUp />
                    ) : (
                        <IoIosArrowDown color='var(--text1)' />
                    )}
                </div>

                <div className={styles.sortOptions}>
                    <IoIosArrowUp size={14} />
                    <IoIosArrowDown size={14} />
                </div>
            </div>

            {isTimeDropdownOpen && (
                <div className={styles.dropdown}>
                    {creationTimeData.map((item, idx) => (
                        <p className={styles.timeItem} key={idx}>
                            {item.label}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );

    const tickerTableDisplay = (
        <div className={styles.tickerTableContainer}>
            <div className={styles.tickerHeader}>
                <p>TICKER</p>
                <p>MARKET CAP</p>
                <p>REMAINING</p>
                <div className={styles.statusContainer}>
                    <span />
                </div>
            </div>
            <div className={styles.tickerTableContent}>
                {tickerData.map((item, idx) => (
                    <TickerItem tickerItem={item} key={idx} />
                ))}
            </div>
        </div>
    );

    const claimAllContainer = (
        <div className={styles.claimAllContainer}>
            <h3>CLAIM ALL</h3>
            <p>CLAIM ALL TOKENS FROM WINNING AUCTIONS AND UNUSED BIDS</p>

            <div className={styles.extraFeeContainer}>
                <div className={styles.alignCenter}>
                    <p>NETWORK FEE</p>
                    <TooltipComponent title='Estimated network fee (i.e. gas cost) to join bid' />
                </div>
                <p style={{ color: 'var(--text2)' }}>~0.01</p>
            </div>
        </div>
    );
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <BreadCrumb />
                <h2>Account</h2>
                {searchContainer}
                {timeDropdown}
                {tickerTableDisplay}
            </div>
            {claimAllContainer}
            <button className={styles.claimButton}>CLAIM ALL</button>
        </div>
    );
}

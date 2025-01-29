import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BiSearch } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { LuCheck, LuPencil } from 'react-icons/lu';
import { FaEye } from 'react-icons/fa';

import styles from './ResizeableTableHeader.module.css';
import { AuctionsContext } from '../../../../contexts';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import {
    AuctionDataIF,
    diffHashSig,
} from '../../../../ambient-utils/dataLayer';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../../pages/platformFuta/Auctions/useSortedAuctions';
import { auctionDataSets } from '../../../../pages/platformFuta/Account/Account';

interface FilterOptionIF {
    label: string;
    value: string;
    slug: auctionSorts;
    default: 'asc' | 'desc';
}

interface ResizeableTableHeaderProps {
    auctions: sortedAuctionsIF;
    dataState?: {
        active: auctionDataSets;
        toggle: (set?: auctionDataSets) => void;
    };
    isAccount?: boolean;
    placeholderTicker?: boolean;
    searchInputRaw: string;
    setSearchInputRaw: React.Dispatch<React.SetStateAction<string>>;
    filteredData: AuctionDataIF[];
    activeSortOption: FilterOptionIF;
    setActiveSortOption: React.Dispatch<React.SetStateAction<FilterOptionIF>>;
}

const SORT_OPTIONS = [
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
] as const;

export default function ResizeableTableHeader(
    props: ResizeableTableHeaderProps,
) {
    const {
        auctions,
        isAccount,
        dataState,
        searchInputRaw,
        setSearchInputRaw,
        filteredData,
        activeSortOption,
        setActiveSortOption,
    } = props;

    const {
        showComplete,
        setShowComplete,
        watchlists,
        setFilteredAuctionList,
    } = useContext(AuctionsContext);

    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(dropdownRef, () => setIsSortDropdownOpen(false));

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (
                e.code === 'Escape' &&
                document.activeElement?.id === 'ticker_auction_search_input'
            ) {
                setSearchInputRaw('');
                document.getElementById('ticker_auction_search_input')?.focus();
            }
        };
        document.body.addEventListener('keydown', handleEscape);
        return () => document.body.removeEventListener('keydown', handleEscape);
    }, [searchInputRaw, searchInputRaw]);

    useEffect(() => {
        setFilteredAuctionList(filteredData);
    }, [diffHashSig(filteredData)]);

    const [incomplete, complete] = useMemo(() => {
        return auctions.data.reduce<[AuctionDataIF[], AuctionDataIF[]]>(
            (acc, auction) => {
                const isComplete =
                    auction.createdAt <=
                    (Date.now() - auction.auctionLength * 1000) / 1000;
                acc[isComplete ? 1 : 0].push(auction);
                return acc;
            },
            [[], []],
        );
    }, [auctions.data, Math.floor(Date.now() / 1000 / 5)]);

    useEffect(() => {
        if (!incomplete.length && complete.length) {
            setShowComplete(true);
        }
    }, [incomplete.length, complete.length]);

    const sortDirection =
        auctions.active === 'marketCap'
            ? auctions.isReversed
                ? 'up'
                : 'down'
            : auctions.active === 'timeLeft'
              ? auctions.isReversed
                  ? 'down'
                  : 'up'
              : null;

    return (
        <search className={styles.header}>
            <div className={styles.search_and_sort}>
                {/* Search Input */}
                <div className={styles.text_search_box}>
                    <BiSearch
                        size={20}
                        color='var(--text2)'
                        onClick={() =>
                            document
                                .getElementById('ticker_auction_search_input')
                                ?.focus()
                        }
                    />
                    <input
                        id='ticker_auction_search_input'
                        type='text'
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
                            onClick={() => {
                                setSearchInputRaw('');
                                document
                                    .getElementById(
                                        'ticker_auction_search_input',
                                    )
                                    ?.focus();
                            }}
                        />
                    )}
                </div>

                {/* Sort Dropdown */}
                <div className={styles.sort_clickable} ref={dropdownRef}>
                    <div className={styles.sort_selection}>
                        <div
                            className={styles.open_dropdown_clickable}
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
                                    sortDirection === 'up'
                                        ? 'var(--accent1)'
                                        : ''
                                }
                            />
                            <IoIosArrowDown
                                size={14}
                                color={
                                    sortDirection === 'down'
                                        ? 'var(--accent1)'
                                        : ''
                                }
                            />
                        </div>
                    </div>

                    {isSortDropdownOpen && (
                        <div className={styles.dropdown}>
                            {SORT_OPTIONS.map((option) => (
                                <p
                                    key={option.slug}
                                    className={
                                        styles[
                                            activeSortOption.slug ===
                                            option.slug
                                                ? 'active_sort'
                                                : 'inactive_sort'
                                        ]
                                    }
                                    onClick={() => {
                                        setActiveSortOption(option);
                                        setIsSortDropdownOpen(false);
                                        auctions.update(option.slug);
                                    }}
                                >
                                    {option.label}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Buttons */}
            <div className={styles.filters}>
                <button
                    onClick={() => setShowComplete(!showComplete)}
                    className={
                        styles[showComplete ? 'button_on' : 'button_off']
                    }
                >
                    <LuCheck size={17} />
                    <div>COMPLETED</div>
                </button>

                {!isAccount && (
                    <button
                        onClick={watchlists.toggle}
                        className={
                            styles[
                                watchlists.shouldDisplay
                                    ? 'button_on'
                                    : 'button_off'
                            ]
                        }
                    >
                        <FaEye size={17} />
                        <div>WATCHLIST</div>
                    </button>
                )}

                {isAccount && (
                    <button
                        className={
                            styles[
                                dataState?.active === 'created'
                                    ? 'button_on'
                                    : 'button_off'
                            ]
                        }
                        onClick={() => dataState?.toggle && dataState.toggle()}
                    >
                        <LuPencil size={17} />
                        <div>CREATED</div>
                    </button>
                )}
            </div>
        </search>
    );
}

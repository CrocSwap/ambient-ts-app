import { BiSearch } from 'react-icons/bi';
import styles from './ResizeableTableHeader.module.css';
import { MdClose } from 'react-icons/md';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
    auctionSorts,
    sortedAuctionsIF,
} from '../../../../pages/platformFuta/Auctions/useSortedAuctions';
import {
    AuctionDataIF,
    diffHashSig,
} from '../../../../ambient-utils/dataLayer';
import { auctionDataSets } from '../../../../pages/platformFuta/Account/Account';
import { AuctionsContext } from '../../../../contexts';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { LuCheck, LuPencil } from 'react-icons/lu';
import { FaEye } from 'react-icons/fa';
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
    searchInputRaw: string;
    setSearchInputRaw: React.Dispatch<React.SetStateAction<string>>;
    filteredData: AuctionDataIF[];
    activeSortOption: filterOptionIF;
    setActiveSortOption: React.Dispatch<React.SetStateAction<filterOptionIF>>;
}
export default function ResizeableTableHeader(props: propsIF) {
    const {
        showComplete,
        setShowComplete,
        watchlists,
        setFilteredAuctionList,
    } = useContext(AuctionsContext);
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

    const [isSortDropdownOpen, setIsSortDropdownOpen] =
        useState<boolean>(false);
    // scrolling is disabled when hover on table

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

    // DOM id for search input field
    const INPUT_DOM_ID = 'ticker_auction_search_input';

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

    const timeDropdownRef = useRef<HTMLDivElement>(null);

    // fn to close the sort filter menu when user clicks outside
    const clickOutsideHandler = (): void => {
        setIsSortDropdownOpen(false);
    };

    // hook to handle user click outside of the dropdown modal
    useOnClickOutside(timeDropdownRef, clickOutsideHandler);

    // useEffect(() => {
    //     if (placeholderTicker) setSelectedTicker(undefined);
    // }, [placeholderTicker]);

    useEffect(() => {
        setFilteredAuctionList(filteredData);
    }, [diffHashSig(filteredData)]);

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

    return (
        <search className={styles.header}>
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
                            className={styles.open_dropdown_clickable}
                            onClick={() =>
                                setIsSortDropdownOpen(!isSortDropdownOpen)
                            }
                        >
                            <p>{activeSortOption.label}</p>
                            {isSortDropdownOpen ? (
                                <IoIosArrowUp color='var(--accent1)' />
                            ) : (
                                <IoIosArrowDown
                                    onClick={(e) => {
                                        // without this handler the click will not register
                                        // ... properly to open the dropdown menu
                                        e.stopPropagation();
                                        setIsSortDropdownOpen(
                                            !isSortDropdownOpen,
                                        );
                                    }}
                                    color='var(--accent1)'
                                />
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
                                    key={idx}
                                    className={
                                        styles[
                                            activeSortOption.slug === item.slug
                                                ? 'active_sort'
                                                : 'inactive_sort'
                                        ]
                                    }
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
                    className={
                        styles[showComplete ? 'button_on' : 'button_off']
                    }
                >
                    <LuCheck size={BUTTON_ICON_SIZE} />
                    <div>COMPLETED</div>
                </button>
                {isAccount || (
                    <button
                        onClick={() => watchlists.toggle()}
                        className={
                            styles[
                                watchlists.shouldDisplay
                                    ? 'button_on'
                                    : 'button_off'
                            ]
                        }
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
                                    : 'button_off'
                            ]
                        }
                        onClick={() => dataState?.toggle && dataState.toggle()}
                    >
                        <LuPencil size={BUTTON_ICON_SIZE} />
                        <div>CREATED</div>
                    </button>
                ) : null}
            </div>
        </search>
    );
}

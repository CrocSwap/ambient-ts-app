// START: Import React and Dongles
import { SetStateAction, Dispatch, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import { BsChevronBarDown } from 'react-icons/bs';

// START: Import JSX Elements
import SidebarAccordion from './SidebarAccordion/SidebarAccordion';
import TopPools from '../../../components/Global/Sidebar/TopPools/TopPools';
import FavoritePools from '../../../components/Global/Sidebar/FavoritePools/FavoritePools';
import SidebarRangePositions from '../../../components/Global/Sidebar/SidebarRangePositions/SidebarRangePositions';
import SidebarLimitOrders from '../../../components/Global/Sidebar/SidebarLimitOrders/SidebarLimitOrders';
import SidebarRecentTransactions from '../../../components/Global/Sidebar/SidebarRecentTransactions/SidebarRecentTransactions';

// START: Import Local Files
import styles from './Sidebar.module.css';

import favouritePoolsImage from '../../../assets/images/sidebarImages/favouritePools.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTx.svg';
import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import recentPoolsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import {
    TokenIF,
    TokenPairIF,
    TempPoolIF,
} from '../../../utils/interfaces/exports';
import SidebarSearchResults from './SidebarSearchResults/SidebarSearchResults';
import { MdClose } from 'react-icons/md';

import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import { memoizePoolStats } from '../../functions/getPoolStats';
import { tradeData } from '../../../utils/state/tradeDataSlice';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import RecentPools from '../../../components/Global/Sidebar/RecentPools/RecentPools';
import { useSidebarSearch, sidebarSearchIF } from './useSidebarSearch';
import { recentPoolsMethodsIF } from '../../hooks/useRecentPools';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { favePoolsMethodsIF } from '../../hooks/useFavePools';
import { ackTokensMethodsIF } from '../../hooks/useAckTokens';
import { topPoolIF } from '../../hooks/useTopPools';
import { sidebarMethodsIF } from '../../hooks/useSidebar';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

const cachedPoolStatsFetch = memoizePoolStats();

// interface for component props
interface propsIF {
    sidebar: sidebarMethodsIF;
    tradeData: tradeData;
    isDenomBase: boolean;
    chainId: string;
    poolId: number;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    favePools: favePoolsMethodsIF;
    selectedOutsideTab: number;
    outsideControl: boolean;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    openModalWallet: () => void;
    poolList: TempPoolIF[];
    verifyToken: (addr: string, chn: string) => boolean;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    recentPools: recentPoolsMethodsIF;
    isConnected: boolean;
    ackTokens: ackTokensMethodsIF;
    topPools: topPoolIF[];
}

export default function Sidebar(props: propsIF) {
    const {
        sidebar,
        tradeData,
        isDenomBase,
        chainId,
        poolId,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        setCurrentPositionActive,
        isShowAllEnabled,
        setIsShowAllEnabled,
        expandTradeTable,
        setExpandTradeTable,
        tokenMap,
        lastBlockNumber,
        favePools,
        setAnalyticsSearchInput,
        openModalWallet,
        poolList,
        verifyToken,
        getTokenByAddress,
        tokenPair,
        recentPools,
        isConnected,
        outsideControl,
        setOutsideControl,
        selectedOutsideTab,
        setSelectedOutsideTab,
        ackTokens,
        topPools,
    } = props;

    const location = useLocation();

    const graphData = useAppSelector((state) => state.graphData);

    const positionsByUser = graphData.positionsByUser.positions.filter(
        (x) => x.chainId === chainId,
    );

    const txsByUser = graphData.changesByUser.changes.filter(
        (x) => x.chainId === chainId,
    );

    const limitsByUser = graphData.limitOrdersByUser.limitOrders.filter(
        (x) => x.chainId === chainId,
    );

    const mostRecentTxs = txsByUser.slice(0, 4);
    const mostRecentPositions = positionsByUser.slice(0, 4);
    const mostRecentLimitOrders = limitsByUser.slice(0, 4);

    const recentPoolsData = [
        {
            name: 'Recent Pools',
            icon: recentPoolsImage,

            data: (
                <RecentPools
                    tradeData={tradeData}
                    chainId={chainId}
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                    lastBlockNumber={lastBlockNumber}
                    recentPools={recentPools}
                />
            ),
        },
    ];
    const topPoolsSection = [
        {
            name: 'Top Pools',
            icon: topPoolsImage,

            data: (
                <TopPools
                    tradeData={tradeData}
                    chainId={chainId}
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                    lastBlockNumber={lastBlockNumber}
                    poolList={poolList}
                    topPools={topPools}
                />
            ),
        },
    ];

    const rangePositions = [
        {
            name: 'Range Positions',
            icon: rangePositionsImage,
            data: (
                <SidebarRangePositions
                    chainId={chainId}
                    userPositions={mostRecentPositions}
                    isDenomBase={isDenomBase}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    setOutsideControl={setOutsideControl}
                    setCurrentPositionActive={setCurrentPositionActive}
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    closeSidebar={sidebar.close}
                    isUserLoggedIn={isConnected}
                />
            ),
        },
    ];

    const recentLimitOrders = [
        {
            name: 'Limit Orders',
            icon: openOrdersImage,
            data: (
                <SidebarLimitOrders
                    isDenomBase={isDenomBase}
                    tokenMap={tokenMap}
                    chainId={chainId}
                    limitOrderByUser={mostRecentLimitOrders}
                    selectedOutsideTab={selectedOutsideTab}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    outsideControl={outsideControl}
                    setOutsideControl={setOutsideControl}
                    isShowAllEnabled={isShowAllEnabled}
                    setCurrentPositionActive={setCurrentPositionActive}
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    expandTradeTable={expandTradeTable}
                    setExpandTradeTable={setExpandTradeTable}
                    isUserLoggedIn={isConnected}
                    closeSidebar={sidebar.close}
                />
            ),
        },
    ];

    const favoritePools = [
        {
            name: 'Favorite Pools',
            icon: favouritePoolsImage,

            data: (
                <FavoritePools
                    favePools={favePools}
                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                    lastBlockNumber={lastBlockNumber}
                    chainId={chainId}
                    poolId={poolId}
                />
            ),
        },
    ];

    const recentTransactions = [
        {
            name: 'Transactions',
            icon: recentTransactionsImage,

            data: (
                <SidebarRecentTransactions
                    mostRecentTransactions={mostRecentTxs}
                    coinGeckoTokenMap={tokenMap}
                    currentTxActiveInTransactions={
                        currentTxActiveInTransactions
                    }
                    setCurrentTxActiveInTransactions={
                        setCurrentTxActiveInTransactions
                    }
                    chainId={chainId}
                    isShowAllEnabled={isShowAllEnabled}
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    expandTradeTable={expandTradeTable}
                    setExpandTradeTable={setExpandTradeTable}
                    selectedOutsideTab={selectedOutsideTab}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    setOutsideControl={setOutsideControl}
                    outsideControl={outsideControl}
                    isUserLoggedIn={isConnected}
                    closeSidebar={sidebar.close}
                />
            ),
        },
    ];

    const searchData: sidebarSearchIF = useSidebarSearch(
        poolList,
        positionsByUser,
        txsByUser,
        limitsByUser,
        verifyToken,
        ackTokens,
    );

    const [searchInput, setSearchInput] = useState<string[][]>();
    const [searchMode, setSearchMode] = useState(false);
    false && searchMode;

    const searchInputRef = useRef(null);

    const handleInputClear = () => {
        setSearchInput([]);
        setSearchMode(false);
        const currentInput = document.getElementById(
            'search_input',
        ) as HTMLInputElement;
        currentInput.value = '';
    };

    // ------------------------------------------
    // ---------------------------ANALYTICS SEARCH CONTAINER-----------------------

    const focusInput = () => {
        const inputField = document.getElementById(
            'search_input',
        ) as HTMLInputElement;

        inputField.focus();
    };

    const handleInputClearAnalytics = () => {
        const currentInput = document.getElementById(
            'search_input_analytics',
        ) as HTMLInputElement;

        currentInput.value = '';
    };
    const AnalyticsSearchContainer = (
        <div className={styles.search_container}>
            <div
                className={styles.search__icon}
                onClick={() => sidebar.toggle()}
            >
                <BiSearch size={18} color='#CDC1FF' />
            </div>
            <input
                type='text'
                id='search_input_analytics'
                placeholder='Search token or pools...'
                className={styles.search__box}
                onChange={(e) => setAnalyticsSearchInput(e.target.value)}
            />
            {searchInput !== undefined && (
                <div
                    onClick={handleInputClearAnalytics}
                    className={styles.close_icon}
                >
                    <MdClose size={18} color='#ebebeb66' />{' '}
                </div>
            )}
        </div>
        // ---------------------------END OF ANALYTICS SEARCH CONTAINER-----------------------
    );

    const inputContent = document.getElementById(
        'search_input',
    ) as HTMLInputElement;

    // TODO (#1516): we consider introducing a maximum length for searchable text
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchMode(true);
        searchData.setInput(e.target.value);
    };
    const searchContainer = (
        <div className={styles.search_container}>
            <div className={styles.search__icon} onClick={focusInput}>
                <BiSearch size={18} color='#CDC1FF' />
            </div>
            <input
                type='text'
                id='search_input'
                ref={searchInputRef}
                placeholder='Search anything...'
                className={styles.search__box}
                onChange={(e) => handleSearchInput(e)}
                spellCheck='false'
                autoFocus
            />
            {inputContent?.value && (
                <div onClick={handleInputClear} className={styles.close_icon}>
                    <MdClose size={20} color='#ebebeb66' />{' '}
                </div>
            )}
        </div>
    );

    const [openAllDefault, setOpenAllDefault] = useState(false);
    const [isDefaultOverridden, setIsDefaultOverridden] = useState(false);

    const openAllButton = (
        <button
            onClick={() => {
                setIsDefaultOverridden(true);
                if (sidebar.status === 'closed') {
                    sidebar.open();
                }
                setOpenAllDefault(true);
            }}
            className={styles.open_all_button}
        >
            <BsChevronBarDown size={18} color='var(--text-grey-light)' />{' '}
            {!sidebar.isOpen || !openAllDefault ? 'Expand All' : 'Collapse All'}
        </button>
    );

    const collapseButton = (
        <button
            onClick={() => {
                setIsDefaultOverridden(true);
                setOpenAllDefault(false);
            }}
            className={styles.open_all_button}
        >
            <BsChevronBarDown size={18} color='var(--text-grey-light)' />{' '}
            {'Collapse All'}
        </button>
    );

    const searchContainerDisplay = (
        <div
            className={` ${styles.sidebar_link_search} ${styles.main_search_container}`}
        >
            {location.pathname.includes('analytics')
                ? AnalyticsSearchContainer
                : searchContainer}
            {sidebar.isOpen ? (
                <DefaultTooltip
                    interactive
                    title={!openAllDefault ? openAllButton : collapseButton}
                    placement={'right'}
                    arrow
                    enterDelay={100}
                    leaveDelay={200}
                >
                    <div style={{ cursor: 'pointer', display: 'flex' }}>
                        <img
                            src={closeSidebarImage}
                            alt='close sidebar'
                            onClick={() => sidebar.close('persist')}
                        />
                    </div>
                </DefaultTooltip>
            ) : (
                <DefaultTooltip
                    interactive
                    title={openAllButton}
                    placement={sidebar.isOpen ? 'bottom' : 'right'}
                    arrow
                    enterDelay={100}
                    leaveDelay={200}
                >
                    <div style={{ cursor: 'pointer', rotate: '180deg' }}>
                        <img
                            src={closeSidebarImage}
                            alt='open sidebar'
                            onClick={() => sidebar.open('persist')}
                        />
                    </div>
                </DefaultTooltip>
            )}
        </div>
    );
    const sidebarRef = useRef<HTMLDivElement>(null);

    const overflowSidebarMQ = useMediaQuery('(max-width: 1700px)');

    useEffect(() => {
        overflowSidebarMQ ? sidebar.close() : sidebar.open();
    }, [overflowSidebarMQ]);

    function handleSidebarClickOutside() {
        if (!overflowSidebarMQ) return;
        sidebar.close();
    }

    useOnClickOutside(sidebarRef, handleSidebarClickOutside);

    const sidebarStyle = sidebar.isOpen
        ? styles.sidebar_active
        : styles.sidebar;

    const topElementsDisplay = (
        <div style={{ width: '100%' }}>
            {topPoolsSection.map((item, idx) => (
                <SidebarAccordion
                    sidebar={sidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={true}
                    idx={idx}
                    item={item}
                    key={idx}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}
            {favoritePools.map((item, idx) => (
                <SidebarAccordion
                    sidebar={sidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={true}
                    idx={idx}
                    item={item}
                    key={idx}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}
            {recentPoolsData.map((item, idx) => (
                <SidebarAccordion
                    sidebar={sidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={true}
                    idx={idx}
                    item={item}
                    key={idx}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}
        </div>
    );

    const bottomElementsDisplay = (
        <div className={styles.bottom_elements}>
            {recentTransactions.map((item, idx) => (
                <SidebarAccordion
                    sidebar={sidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={false}
                    idx={idx}
                    item={item}
                    key={idx}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}{' '}
            {recentLimitOrders.map((item, idx) => (
                <SidebarAccordion
                    sidebar={sidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={false}
                    idx={idx}
                    item={item}
                    key={idx}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}{' '}
            {rangePositions.map((item, idx) => (
                <SidebarAccordion
                    sidebar={sidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={false}
                    idx={idx}
                    item={item}
                    key={idx}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}
        </div>
    );

    const regularSidebarDisplay = (
        <>
            {topElementsDisplay}
            {bottomElementsDisplay}
        </>
    );

    return (
        <div ref={sidebarRef}>
            <nav
                className={`${styles.sidebar} ${sidebarStyle}`}
                onClick={() => {
                    sidebar.isOpen || sidebar.open('persist');
                }}
                style={!sidebar.isOpen ? { cursor: 'pointer' } : undefined}
            >
                <ul className={styles.sidebar_nav}>
                    {searchContainerDisplay}
                    {searchData.isInputValid && sidebar.isOpen && searchMode ? (
                        <SidebarSearchResults
                            searchData={searchData}
                            getTokenByAddress={getTokenByAddress}
                            tokenPair={tokenPair}
                            isDenomBase={isDenomBase}
                            chainId={chainId}
                            isConnected={isConnected}
                            cachedPoolStatsFetch={cachedPoolStatsFetch}
                            setOutsideControl={setOutsideControl}
                            setSelectedOutsideTab={setSelectedOutsideTab}
                            setCurrentPositionActive={setCurrentPositionActive}
                            setCurrentTxActiveInTransactions={
                                setCurrentTxActiveInTransactions
                            }
                            setIsShowAllEnabled={setIsShowAllEnabled}
                            ackTokens={ackTokens}
                        />
                    ) : (
                        regularSidebarDisplay
                    )}
                </ul>
            </nav>
        </div>
    );
}

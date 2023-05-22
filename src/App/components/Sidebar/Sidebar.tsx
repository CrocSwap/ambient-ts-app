// START: Import React and Dongles
import {
    SetStateAction,
    Dispatch,
    useState,
    useEffect,
    useRef,
    useContext,
    memo,
} from 'react';
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
import { TokenPairIF, TempPoolIF } from '../../../utils/interfaces/exports';
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
import { topPoolIF } from '../../hooks/useTopPools';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { tokenMethodsIF } from '../../hooks/useTokens';

const cachedPoolStatsFetch = memoizePoolStats();

// interface for component props
interface propsIF {
    tradeData: tradeData;
    isDenomBase: boolean;
    chainId: string;
    poolId: number;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    analyticsSearchInput: string;
    setAnalyticsSearchInput: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
    openModalWallet: () => void;
    poolList: TempPoolIF[];
    verifyToken: (addr: string, chn: string) => boolean;
    tokenPair: TokenPairIF;
    recentPools: recentPoolsMethodsIF;
    isConnected: boolean;
    topPools: topPoolIF[];
    tokens: tokenMethodsIF;
}

function Sidebar(props: propsIF) {
    const {
        tradeData,
        isDenomBase,
        chainId,
        poolId,
        setCurrentTxActiveInTransactions,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        lastBlockNumber,
        setAnalyticsSearchInput,
        openModalWallet,
        poolList,
        tokenPair,
        recentPools,
        isConnected,
        topPools,
        tokens,
    } = props;

    const { sidebar } = useContext(AppStateContext);

    const location = useLocation();

    const graphData = useAppSelector((state) => state.graphData);

    const overflowSidebarMQ = useMediaQuery('(min-width: 4000px)');

    useEffect(() => {
        overflowSidebarMQ
            ? sidebar.close()
            : sidebar.isOpen
            ? sidebar.open()
            : null;
    }, [overflowSidebarMQ, sidebar.isOpen]);

    const filterFn = <T extends { chainId: string }>(x: T) =>
        x.chainId === chainId;

    const positionsByUser =
        graphData.positionsByUser.positions.filter(filterFn);
    const txsByUser = graphData.changesByUser.changes.filter(filterFn);
    const limitsByUser =
        graphData.limitOrdersByUser.limitOrders.filter(filterFn);

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
                    setCurrentPositionActive={setCurrentPositionActive}
                    setIsShowAllEnabled={setIsShowAllEnabled}
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
                    chainId={chainId}
                    isDenomBase={isDenomBase}
                    tokens={tokens}
                    limitOrderByUser={mostRecentLimitOrders}
                    setCurrentPositionActive={setCurrentPositionActive}
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    isUserLoggedIn={isConnected}
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
                    chainId={chainId}
                    mostRecentTransactions={mostRecentTxs}
                    setCurrentTxActiveInTransactions={
                        setCurrentTxActiveInTransactions
                    }
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    isUserLoggedIn={isConnected}
                />
            ),
        },
    ];

    const searchData: sidebarSearchIF = useSidebarSearch(
        poolList,
        positionsByUser,
        txsByUser,
        limitsByUser,
        tokens,
    );

    const [searchInput, setSearchInput] = useState<string>('');
    const [searchMode, setSearchMode] = useState(false);
    false && searchMode;

    const searchInputRef = useRef(null);

    const handleInputClear = () => {
        setSearchInput('');
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
            {!searchInput && (
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

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchMode(true);
        searchData.setInput(e.target.value);
        setSearchInput(e.target.value);
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
                placeholder='Search...'
                maxLength={40}
                className={styles.search__box}
                onChange={(e) => handleSearchInput(e)}
                spellCheck='false'
                autoFocus
            />
            {searchInput && (
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
                if (!sidebar.isOpen) {
                    sidebar.open();
                }
                setOpenAllDefault(true);
            }}
            className={styles.open_all_button}
        >
            <BsChevronBarDown size={18} color='var(--text2)' />{' '}
            {openAllDefault ? 'Collapse All' : 'Expand All'}
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
            <BsChevronBarDown size={18} color='var(--text2)' /> {'Collapse All'}
        </button>
    );

    const searchContainerDisplay = (
        <div
            className={` ${styles.sidebar_link_search} ${
                styles.main_search_container
            } ${!sidebar.isOpen && styles.sidebar_link_search_closed}`}
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
                            onClick={() => sidebar.close(true)}
                        />
                    </div>
                </DefaultTooltip>
            ) : (
                <BiSearch
                    size={18}
                    color='#CDC1FF'
                    onClick={() => sidebar.open(true)}
                />
            )}
        </div>
    );
    const sidebarRef = useRef<HTMLDivElement>(null);

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
                    sidebar.isOpen || sidebar.open(true);
                }}
                style={!sidebar.isOpen ? { cursor: 'pointer' } : undefined}
            >
                <div className={styles.sidebar_nav}>
                    {searchContainerDisplay}
                    {searchData.isInputValid && sidebar.isOpen && searchMode ? (
                        <SidebarSearchResults
                            searchData={searchData}
                            tokenPair={tokenPair}
                            isDenomBase={isDenomBase}
                            chainId={chainId}
                            isConnected={isConnected}
                            cachedPoolStatsFetch={cachedPoolStatsFetch}
                            setCurrentPositionActive={setCurrentPositionActive}
                            setCurrentTxActiveInTransactions={
                                setCurrentTxActiveInTransactions
                            }
                            setIsShowAllEnabled={setIsShowAllEnabled}
                        />
                    ) : (
                        regularSidebarDisplay
                    )}
                </div>
            </nav>
        </div>
    );
}

export default memo(Sidebar);

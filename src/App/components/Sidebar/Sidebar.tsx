// START: Import React and Dongles
import {
    MouseEvent,
    SetStateAction,
    Dispatch,
    useState,
    useEffect,
    useRef,
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
import {
    LimitOrderIF,
    PositionIF,
    TokenIF,
    TokenPairIF,
    TempPoolIF,
    TransactionIF,
} from '../../../utils/interfaces/exports';
import SidebarSearchResults from './SidebarSearchResults/SidebarSearchResults';
import { MdClose } from 'react-icons/md';

import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import { memoizePoolStats } from '../../functions/getPoolStats';
import { tradeData } from '../../../utils/state/tradeDataSlice';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import RecentPools from '../../../components/Global/Sidebar/RecentPools/RecentPools';
import { useSidebarSearch } from './useSidebarSearch';
import { recentPoolsMethodsIF } from '../../hooks/useRecentPools';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { favePoolsMethodsIF } from '../../hooks/useFavePools';
import { ackTokensMethodsIF } from '../../hooks/useAckTokens';
import { topPoolIF } from '../../hooks/useTopPools';

const cachedPoolStatsFetch = memoizePoolStats();

// interface for component props
interface propsIF {
    tradeData: tradeData;
    isDenomBase: boolean;
    showSidebar: boolean;
    setShowSidebar: Dispatch<SetStateAction<boolean>>;
    toggleSidebar: (
        event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>,
    ) => void;
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
    positionsByUser: PositionIF[];
    txsByUser: TransactionIF[];
    limitsByUser: LimitOrderIF[];
    ackTokens: ackTokensMethodsIF;
    topPools: topPoolIF[];
}

export default function Sidebar(props: propsIF) {
    const {
        tradeData,
        isDenomBase,
        toggleSidebar,
        showSidebar,
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
        setShowSidebar,
        setAnalyticsSearchInput,
        openModalWallet,
        poolList,
        verifyToken,
        getTokenByAddress,
        tokenPair,
        recentPools,
        isConnected,
        positionsByUser,
        setOutsideControl,
        setSelectedOutsideTab,
        txsByUser,
        limitsByUser,
        ackTokens,
        topPools,
    } = props;

    const location = useLocation();

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
                    setShowSidebar={setShowSidebar}
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
                    selectedOutsideTab={props.selectedOutsideTab}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    outsideControl={props.outsideControl}
                    setOutsideControl={setOutsideControl}
                    isShowAllEnabled={isShowAllEnabled}
                    setCurrentPositionActive={setCurrentPositionActive}
                    setIsShowAllEnabled={props.setIsShowAllEnabled}
                    expandTradeTable={expandTradeTable}
                    setExpandTradeTable={setExpandTradeTable}
                    isUserLoggedIn={isConnected}
                    setShowSidebar={setShowSidebar}
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
                    selectedOutsideTab={props.selectedOutsideTab}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    setOutsideControl={setOutsideControl}
                    outsideControl={props.outsideControl}
                    isUserLoggedIn={isConnected}
                    setShowSidebar={setShowSidebar}
                />
            ),
        },
    ];

    const [
        setRawInput,
        isInputValid,
        searchedPools,
        searchedPositions,
        searchedTxs,
        searchedLimitOrders,
    ] = useSidebarSearch(
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
            <div className={styles.search__icon} onClick={toggleSidebar}>
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
        setRawInput(e.target.value);
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
                if (!showSidebar) {
                    setShowSidebar(true);
                }
                setOpenAllDefault(true);
            }}
            className={styles.open_all_button}
        >
            <BsChevronBarDown size={18} color='var(--text-grey-light)' />{' '}
            {!showSidebar || !openAllDefault ? 'Expand All' : 'Collapse All'}
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
            {showSidebar ? (
                <DefaultTooltip
                    interactive
                    title={!openAllDefault ? openAllButton : collapseButton}
                    // placement={'bottom'}
                    placement={showSidebar ? 'right' : 'right'}
                    arrow
                    enterDelay={100}
                    leaveDelay={200}
                >
                    <div style={{ cursor: 'pointer', display: 'flex' }}>
                        <img
                            src={closeSidebarImage}
                            alt='close sidebar'
                            onClick={toggleSidebar}
                        />
                    </div>
                </DefaultTooltip>
            ) : (
                <DefaultTooltip
                    interactive
                    title={openAllButton}
                    // placement={'bottom'}
                    placement={showSidebar ? 'bottom' : 'right'}
                    arrow
                    enterDelay={100}
                    leaveDelay={200}
                >
                    <div style={{ cursor: 'pointer', rotate: '180deg' }}>
                        <img
                            src={closeSidebarImage}
                            alt='open sidebar'
                            onClick={toggleSidebar}
                        />
                    </div>
                </DefaultTooltip>
            )}
        </div>
    );
    const sidebarRef = useRef<HTMLDivElement>(null);

    const overflowSidebarMQ = useMediaQuery('(max-width: 1700px)');

    useEffect(() => {
        if (overflowSidebarMQ) {
            setShowSidebar(false);
        } else setShowSidebar(true);
    }, [overflowSidebarMQ]);

    function handleSidebarClickOutside() {
        if (!overflowSidebarMQ) return;

        setShowSidebar(false);
    }

    useOnClickOutside(sidebarRef, handleSidebarClickOutside);

    const sidebarStyle = showSidebar ? styles.sidebar_active : styles.sidebar;

    const topElementsDisplay = (
        <div style={{ width: '100%' }}>
            {topPoolsSection.map((item, idx) => (
                <SidebarAccordion
                    showSidebar={showSidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={true}
                    idx={idx}
                    item={item}
                    toggleSidebar={toggleSidebar}
                    key={idx}
                    setShowSidebar={setShowSidebar}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}
            {favoritePools.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={true}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                    setShowSidebar={setShowSidebar}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}
            {recentPoolsData.map((item, idx) => (
                <SidebarAccordion
                    showSidebar={showSidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={true}
                    idx={idx}
                    item={item}
                    toggleSidebar={toggleSidebar}
                    key={idx}
                    setShowSidebar={setShowSidebar}
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
                    toggleSidebar={toggleSidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={false}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                    setShowSidebar={setShowSidebar}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}{' '}
            {recentLimitOrders.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={false}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                    setShowSidebar={setShowSidebar}
                    openAllDefault={openAllDefault}
                    openModalWallet={openModalWallet}
                    isDefaultOverridden={isDefaultOverridden}
                />
            ))}{' '}
            {rangePositions.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    shouldDisplayContentWhenUserNotLoggedIn={false}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                    setShowSidebar={setShowSidebar}
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

    const handleClosedSidebarClick = () => {
        showSidebar ? null : setShowSidebar(true);
    };
    return (
        <div ref={sidebarRef}>
            <nav
                className={`${styles.sidebar} ${sidebarStyle}`}
                onClick={handleClosedSidebarClick}
                style={!showSidebar ? { cursor: 'pointer' } : undefined}
            >
                <ul className={styles.sidebar_nav}>
                    {searchContainerDisplay}
                    {isInputValid && showSidebar && searchMode ? (
                        <SidebarSearchResults
                            searchedPools={searchedPools}
                            getTokenByAddress={getTokenByAddress}
                            tokenPair={tokenPair}
                            isDenomBase={isDenomBase}
                            chainId={chainId}
                            isConnected={isConnected}
                            cachedPoolStatsFetch={cachedPoolStatsFetch}
                            searchedPositions={searchedPositions}
                            setOutsideControl={setOutsideControl}
                            setSelectedOutsideTab={setSelectedOutsideTab}
                            setCurrentPositionActive={setCurrentPositionActive}
                            setCurrentTxActiveInTransactions={
                                setCurrentTxActiveInTransactions
                            }
                            setIsShowAllEnabled={setIsShowAllEnabled}
                            searchedTxs={searchedTxs}
                            searchedLimitOrders={searchedLimitOrders}
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

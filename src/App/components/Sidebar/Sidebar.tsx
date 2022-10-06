// START: Import React and Dongles
import { MouseEvent, SetStateAction, Dispatch, useState, useEffect, useRef } from 'react';
import { BiSearch } from 'react-icons/bi';

// START: Import JSX Elements
import SidebarAccordion from './SidebarAccordion/SidebarAccordion';
import TopTokens from '../../../components/Global/Sidebar/TopTokens/TopTokens';
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
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import topTokensImage from '../../../assets/images/sidebarImages/topTokens.svg';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { PoolIF, TokenIF } from '../../../utils/interfaces/exports';
import SidebarSearchResults from './SidebarSearchResults/SidebarSearchResults';
import formatSearchText from './formatSeachText';
import { MdClose } from 'react-icons/md';

import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';

// interface for component props
interface SidebarPropsIF {
    isDenomBase: boolean;
    showSidebar: boolean;
    toggleSidebar: (event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>) => void;
    chainId: string;

    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    favePools: PoolIF[];
    selectedOutsideTab: number;
    outsideControl: boolean;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar(props: SidebarPropsIF) {
    const {
        isDenomBase,
        toggleSidebar,
        showSidebar,
        chainId,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,

        currentPositionActive,
        setCurrentPositionActive,
        isShowAllEnabled,
        setIsShowAllEnabled,

        expandTradeTable,
        setExpandTradeTable,
        tokenMap,
        lastBlockNumber,
        favePools,
    } = props;

    const graphData = useAppSelector((state) => state.graphData);
    const transactionsByUser = graphData.changesByUser.changes;
    const positionsByUser = graphData.positionsByUser.positions;
    const limitOrderByUser = graphData.limitOrdersByUser.limitOrders;

    const mostRecentTransactions = transactionsByUser.slice(0, 4);
    // const mostRecentPositions = positionsByUser.slice(0, 4);

    // TODO:  @Ben this is the map with all the coin gecko token data objects
    // console.assert(coinGeckoTokenMap, 'no map present');

    const topTokens = [
        {
            name: 'Top Tokens',
            icon: topTokensImage,
            data: <TopTokens chainId={chainId} lastBlockNumber={lastBlockNumber} />,
        },
    ];
    const topPoolsSection = [
        {
            name: 'Top Pools',
            icon: topPoolsImage,
            data: <TopPools chainId={chainId} lastBlockNumber={lastBlockNumber} />,
        },
    ];
    const sidebarLimitOrderProps = {
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        isShowAllEnabled: props.isShowAllEnabled,
        setCurrentPositionActive: setCurrentPositionActive,
        setIsShowAllEnabled: props.setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
    };
    const sidebarRangePositionProps = {
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,
        tokenMap: tokenMap,
        isShowAllEnabled: props.isShowAllEnabled,
        setIsShowAllEnabled: props.setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
    };

    const rangePositions = [
        {
            name: 'Range Positions',
            icon: rangePositionsImage,
            data: (
                <SidebarRangePositions
                    userPositions={positionsByUser}
                    isDenomBase={isDenomBase}
                    {...sidebarRangePositionProps}
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
                    limitOrderByUser={limitOrderByUser}
                    {...sidebarLimitOrderProps}
                />
            ),
        },
    ];

    const favoritePools = [
        {
            name: 'Favorite Pools',
            icon: favouritePoolsImage,
            data: <FavoritePools favePools={favePools} lastBlockNumber={lastBlockNumber} />,
        },
    ];

    const recentTransactions = [
        {
            name: 'Recent Transactions',
            icon: recentTransactionsImage,
            data: (
                <SidebarRecentTransactions
                    mostRecentTransactions={mostRecentTransactions}
                    coinGeckoTokenMap={tokenMap}
                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                    setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                    chainId={chainId}
                    isShowAllEnabled={isShowAllEnabled}
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    expandTradeTable={expandTradeTable}
                    setExpandTradeTable={setExpandTradeTable}
                    selectedOutsideTab={props.selectedOutsideTab}
                    setSelectedOutsideTab={props.setSelectedOutsideTab}
                    setOutsideControl={props.setOutsideControl}
                    outsideControl={props.outsideControl}
                />
            ),
        },
    ];

    const [searchInput, setSearchInput] = useState<string[][]>();
    const [searchMode, setSearchMode] = useState(false);
    const [exampleLoading, setExampleLoading] = useState(true);

    const searchInputChangeHandler = (event: string) => {
        setSearchMode(true);
        const formatText = formatSearchText(event);

        setSearchInput(formatText);

        setExampleLoading(true);
    };
    const searchInputRef = useRef(null);

    const handleInputClear = () => {
        setSearchInput([]);
        setSearchMode(false);
        const currentInput = document.getElementById('search_input') as HTMLInputElement;

        currentInput.value = '';
    };

    // we are not going to use this following loading functionality. It is just for demonstration purposes
    useEffect(() => {
        const timer = setTimeout(() => {
            setExampleLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchInput]);
    // ------------------------------------------
    const searchContainer = (
        <div className={styles.main_search_container}>
            <div className={styles.search_container}>
                <div className={styles.search__icon} onClick={toggleSidebar}>
                    <BiSearch size={18} color='#CDC1FF' />
                </div>
                <input
                    type='text'
                    id='search_input'
                    ref={searchInputRef}
                    placeholder='Search anything...'
                    className={styles.search__box}
                    onFocus={() => setSearchMode(true)}
                    onBlur={() => setSearchMode(false)}
                    onChange={(e) => searchInputChangeHandler(e.target.value)}
                />
                {searchInput && searchInput.length > 0 && (
                    <div onClick={handleInputClear}>
                        <MdClose size={18} color='#ebebeb66' />{' '}
                    </div>
                )}
            </div>
        </div>
    );

    // console.log(searchInput);

    const searchContainerDisplay = (
        <div className={`${styles.sidebar_link} ${styles.sidebar_link_search}`}>
            {searchContainer}

            <div>
                <img src={closeSidebarImage} alt='close sidebar' onClick={toggleSidebar} />
            </div>
        </div>
    );

    const sidebarStyle = showSidebar ? styles.sidebar_active : styles.sidebar;

    useEffect(() => {
        if (showSidebar === false) {
            setSearchMode(false);
        }
    }, [showSidebar]);

    const topElementsDisplay = (
        <div style={{ width: '100%' }}>
            {topTokens.map((item, idx) => (
                <SidebarAccordion
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    toggleSidebar={toggleSidebar}
                    key={idx}

                    // mostRecent={mostRecentPositions}
                />
            ))}
            {topPoolsSection.map((item, idx) => (
                <SidebarAccordion
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    toggleSidebar={toggleSidebar}
                    key={idx}
                    mostRecent={['should open automatically']}
                />
            ))}
        </div>
    );

    const bottomElementsDisplay = (
        <div className={styles.bottom_elements}>
            {rangePositions.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                    mostRecent={positionsByUser}
                />
            ))}
            {recentLimitOrders.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                />
            ))}
            {favoritePools.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                />
            ))}
            {recentTransactions.map((item, idx) => (
                <SidebarAccordion
                    toggleSidebar={toggleSidebar}
                    showSidebar={showSidebar}
                    idx={idx}
                    item={item}
                    key={idx}
                    mostRecent={mostRecentTransactions}
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
        <div>
            <nav className={`${styles.sidebar} ${sidebarStyle}`}>
                <ul className={styles.sidebar_nav}>
                    {/* <SearchAccordion
                        showSidebar={showSidebar}
                        toggleSidebar={toggleSidebar}
                        searchMode={searchMode}
                        handleSearchModeToggle={handleSearchModeToggle}
                        setSearchMode={setSearchMode}
                    /> */}
                    {searchContainerDisplay}
                    {searchMode ? (
                        <SidebarSearchResults
                            searchInput={searchInput}
                            exampleLoading={exampleLoading}
                        />
                    ) : (
                        regularSidebarDisplay
                    )}
                </ul>
            </nav>
        </div>
    );
}

// START: Import React and Dongles
import { useState, useRef, useContext, memo } from 'react';
import { useLocation } from 'react-router-dom';
import { BiSearch } from 'react-icons/bi';
import { BsChevronBarDown, BsChevronBarUp } from 'react-icons/bs';

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
import SidebarSearchResults from './SidebarSearchResults/SidebarSearchResults';
import { MdClose } from 'react-icons/md';

import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import RecentPools from '../../../components/Global/Sidebar/RecentPools/RecentPools';
import { useSidebarSearch, sidebarSearchIF } from './useSidebarSearch';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenContext } from '../../../contexts/TokenContext';
import { usePoolList } from '../../hooks/usePoolList';
import { memoizePoolStats } from '../../functions/getPoolStats';
import { Drawer } from '@mui/material';
import { LayoutHandlerContext } from '../../../contexts/LayoutContext';

function Sidebar() {
    const bottomTabs = useMediaQuery('(max-width: 1020px)');

    const {
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const { sidebar } = useContext(SidebarContext);

    const location = useLocation();

    const graphData = useAppSelector((state) => state.graphData);
    const cachedPoolStatsFetch = memoizePoolStats();

    const poolList = usePoolList(chainId, poolIndex);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [analyticsSearchInput, setAnalyticsSearchInput] = useState('');

    const filterFn = <T extends { chainId: string }>(x: T) =>
        x.chainId === chainId;

    const positionsByUser =
        graphData.positionsByUser.positions.filter(filterFn);
    const txsByUser = graphData.changesByUser.changes.filter(filterFn);
    const limitsByUser =
        graphData.limitOrdersByUser.limitOrders.filter(filterFn);

    const mostRecentTxs = txsByUser.slice(0, 4);
    const mostRecentPositions = positionsByUser
        .filter((p) => p.positionLiq > 0)
        .slice(0, 4);
    const mostRecentLimitOrders = limitsByUser.slice(0, 4);

    const recentPoolsData = [
        {
            name: 'Recent Pools',
            icon: recentPoolsImage,

            data: <RecentPools cachedPoolStatsFetch={cachedPoolStatsFetch} />,
        },
    ];
    const topPoolsSection = [
        {
            name: 'Top Pools',
            icon: topPoolsImage,

            data: <TopPools cachedPoolStatsFetch={cachedPoolStatsFetch} />,
        },
    ];

    const rangePositions = [
        {
            name: 'Range Positions',
            icon: rangePositionsImage,
            data: <SidebarRangePositions userPositions={mostRecentPositions} />,
        },
    ];

    const recentLimitOrders = [
        {
            name: 'Limit Orders',
            icon: openOrdersImage,
            data: (
                <SidebarLimitOrders limitOrderByUser={mostRecentLimitOrders} />
            ),
        },
    ];

    const favoritePools = [
        {
            name: 'Favorite Pools',
            icon: favouritePoolsImage,

            data: <FavoritePools cachedPoolStatsFetch={cachedPoolStatsFetch} />,
        },
    ];

    const recentTransactions = [
        {
            name: 'Transactions',
            icon: recentTransactionsImage,
            data: (
                <SidebarRecentTransactions
                    mostRecentTransactions={mostRecentTxs}
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
            {!searchInput && !bottomTabs && (
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
                className={styles.search__box}
                onChange={(e) => handleSearchInput(e)}
                spellCheck='false'
                autoFocus
            />
            {searchInput && !bottomTabs && (
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
            {bottomTabs ? null : openAllDefault ? 'Collapse All' : 'Expand All'}
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
            <BsChevronBarUp size={18} color='var(--text2)' />{' '}
            {!bottomTabs && 'Collapse All'}
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
                    {bottomTabs ? (
                        !openAllDefault ? (
                            openAllButton
                        ) : (
                            collapseButton
                        )
                    ) : (
                        <div style={{ cursor: 'pointer', display: 'flex' }}>
                            <img
                                src={closeSidebarImage}
                                alt='close sidebar'
                                onClick={() => sidebar.close(true)}
                            />
                        </div>
                    )}
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
    const drawerSidebarRef = useRef<HTMLDivElement>(null);

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

    const {
        isSidebarDrawerOpen,

        setIsSidebarDrawerOpen,
    } = useContext(LayoutHandlerContext);

    const mainReturn = (
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
                            cachedPoolStatsFetch={cachedPoolStatsFetch}
                        />
                    ) : (
                        regularSidebarDisplay
                    )}
                </div>
            </nav>
        </div>
    );

    const sidebarDrawer = (
        <Drawer
            anchor='left'
            open={isSidebarDrawerOpen}
            onClose={() => setIsSidebarDrawerOpen(false)}
        >
            {!location.pathname.startsWith('/swap') && (
                <nav
                    className={`${styles.sidebar} ${sidebarStyle}`}
                    ref={drawerSidebarRef}
                >
                    <div className={styles.sidebar_nav}>
                        {searchContainerDisplay}
                        {searchData.isInputValid &&
                        sidebar.isOpen &&
                        searchMode ? (
                            <SidebarSearchResults
                                searchData={searchData}
                                cachedPoolStatsFetch={cachedPoolStatsFetch}
                            />
                        ) : (
                            regularSidebarDisplay
                        )}
                    </div>
                </nav>
            )}
        </Drawer>
    );

    return (
        <>
            {!bottomTabs && mainReturn}
            {bottomTabs && sidebarDrawer}
        </>
    );
}

export default memo(Sidebar);

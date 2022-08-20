// START: Import React and Dongles
import { MouseEvent, SetStateAction, Dispatch, useState, useEffect } from 'react';

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
import SearchAccordion from './SearchAccordion/SearchAccordion';

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
        favePools
    } = props;

    const graphData = useAppSelector((state) => state.graphData);
    const swapsByUser = graphData.swapsByUser.swaps;
    const positionsByUser = graphData.positionsByUser.positions;

    const mostRecentTransactions = swapsByUser.slice(0, 4);
    const mostRecentPositions = positionsByUser.slice(0, 4);

    // TODO:  @Ben this is the map with all the coin gecko token data objects
    // console.assert(coinGeckoTokenMap, 'no map present');

    const topTokens = [
        { name: 'Top Tokens', icon: topTokensImage, data: <TopTokens chainId={chainId} /> },
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
    };

    const recentRangePositions = [
        {
            name: 'Range Positions',
            icon: rangePositionsImage,
            data: (
                <SidebarRangePositions
                    mostRecentPositions={mostRecentPositions}
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
            data: <SidebarLimitOrders {...sidebarLimitOrderProps} />,
        },
    ];

    const favoritePools = [
        { name: 'Favorite Pools', icon: favouritePoolsImage, data: <FavoritePools favePools={favePools} /> },
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

    const [searchMode, setSearchMode] = useState(false);

    const sidebarStyle = showSidebar ? styles.sidebar_active : styles.sidebar;

    useEffect(() => {
        if (showSidebar === false) {
            setSearchMode(false);
        }
    }, [showSidebar]);

    function handleSearchModeToggle() {
        toggleSidebar;

        setSearchMode(!searchMode);
    }

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

    return (
        <div>
            <nav className={`${styles.sidebar} ${sidebarStyle}`}>
                <ul className={styles.sidebar_nav}>
                    <SearchAccordion
                        showSidebar={showSidebar}
                        toggleSidebar={toggleSidebar}
                        searchMode={searchMode}
                        handleSearchModeToggle={handleSearchModeToggle}
                        setSearchMode={setSearchMode}
                    />

                    {!searchMode && topElementsDisplay}
                    <div className={styles.bottom_elements}>
                        {searchMode && topElementsDisplay}

                        {recentRangePositions.map((item, idx) => (
                            <SidebarAccordion
                                toggleSidebar={toggleSidebar}
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                                mostRecent={mostRecentPositions}
                            />
                        ))}
                        {recentLimitOrders.map((item, idx) => (
                            <SidebarAccordion
                                toggleSidebar={toggleSidebar}
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                                // mostRecent={mostRecentTransactions}
                            />
                        ))}
                        {favoritePools.map((item, idx) => (
                            <SidebarAccordion
                                toggleSidebar={toggleSidebar}
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                                // mostRecent={mostRecentTransactions}
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
                </ul>
            </nav>
        </div>
    );
}

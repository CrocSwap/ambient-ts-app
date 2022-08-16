// START: Import React and Dongles
import { MouseEvent, SetStateAction, Dispatch } from 'react';
import { BiSearch } from 'react-icons/bi';

// START: Import JSX Elements
import SidebarAccordion from './SidebarAccordion';
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
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { teardown } from '@mui/utils/useIsFocusVisible';

// interface for component props
interface SidebarPropsIF {
    isDenomBase: boolean;
    showSidebar: boolean;
    toggleSidebar: (event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>) => void;
    chainId: string;
    switchTabToTransactions: boolean;
    handleSetTradeTabToTransaction: () => void;
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;
}

export default function Sidebar(props: SidebarPropsIF) {
    const {
        isDenomBase,
        toggleSidebar,
        showSidebar,
        chainId,
        setSwitchTabToTransactions,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
        setIsShowAllEnabled,
        switchTabToTransactions,
        expandTradeTable,
        setExpandTradeTable,
        tokenMap,
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
        { name: 'Top Pools', icon: topPoolsImage, data: <TopPools chainId={chainId} /> },
    ];
    const recentRangePositions = [
        {
            name: 'Range Positions',
            icon: rangePositionsImage,
            data: (
                <SidebarRangePositions
                    mostRecentPositions={mostRecentPositions}
                    isDenomBase={isDenomBase}
                />
            ),
        },
    ];
    const recentLimitOrders = [
        { name: 'Limit Orders', icon: openOrdersImage, data: <SidebarLimitOrders /> },
    ];

    const favoritePools = [
        { name: 'Favorite Pools', icon: favouritePoolsImage, data: <FavoritePools /> },
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
                    switchTabToTransactions={switchTabToTransactions}
                    setSwitchTabToTransactions={setSwitchTabToTransactions}
                    expandTradeTable={expandTradeTable}
                    setExpandTradeTable={setExpandTradeTable}
                />
            ),
        },
    ];

    function search(text: string) {
        const inputAsArray = text.toLowerCase().split('');
        const separators = [' ', '/', '\\'];

        while (separators.includes(inputAsArray[0])) {
            inputAsArray.shift();
        }

        const outputArray = [];
        let builtString = '';

        while (inputAsArray.length && outputArray.length < 2) {
            const character = inputAsArray.shift();
            if (!separators.includes(character as string)) {
                builtString += character;
            } else {
                outputArray.push(builtString);
                builtString = '';
            }
        }

        builtString.length && outputArray.push(builtString);
        console.log(outputArray);
    }

    const searchContainer = (
        <div className={styles.main_search_container}>
            <div className={styles.search_container}>
                <div className={styles.search__icon} onClick={toggleSidebar}>
                    <BiSearch size={20} color='#CDC1FF' />
                </div>
                <input
                    type='text'
                    id='box'
                    placeholder='Search anything...'
                    className={styles.search__box}
                    onChange={(e) => search(e.target.value)}
                />
            </div>
            <img src={closeSidebarImage} alt='close sidebar' onClick={toggleSidebar} />
        </div>
    );

    const sidebarStyle = showSidebar ? styles.sidebar_active : styles.sidebar;
    return (
        <div>
            <nav className={`${styles.sidebar} ${sidebarStyle}`}>
                <ul className={styles.sidebar_nav}>
                    {searchContainer}

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
                    <div className={styles.bottom_elements}>
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

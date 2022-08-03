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
import { useTokenMap } from './useTokenMap';
import favouritePoolsImage from '../../../assets/images/sidebarImages/favouritePools.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import topTokensImage from '../../../assets/images/sidebarImages/topTokens.svg';
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';

// interface for component props
interface SidebarPropsIF {
    showSidebar: boolean;
    toggleSidebar: (event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>) => void;
    chainId: string;
    switchTabToTransactions: boolean;
    handleSetTradeTabToTransaction: () => void;
    setSwitchTabToTransactions: Dispatch<SetStateAction<boolean>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    currentClickedTxHashFromRecentTx: string;
    SetCurrentClickedTxHashFromRecentTx: Dispatch<SetStateAction<string>>;
}

export default function Sidebar(props: SidebarPropsIF) {
    const {
        toggleSidebar,
        showSidebar,
        chainId,
        setSwitchTabToTransactions,
        isShowAllEnabled,
        setIsShowAllEnabled,
        currentClickedTxHashFromRecentTx,
        SetCurrentClickedTxHashFromRecentTx,
    } = props;

    const graphData = useAppSelector((state) => state.graphData);
    const swapsByUser = graphData.swapsByUser.swaps;

    const mostRecentTransactions = swapsByUser.slice(0, 4);

    // TODO:  @Ben this is the map with all the coin gecko token data objects
    const coinGeckoTokenMap = useTokenMap();
    // console.assert(coinGeckoTokenMap, 'no map present');

    const navItems1 = [
        { name: 'Top Tokens', icon: topTokensImage, data: <TopTokens /> },
        { name: 'Top Pools', icon: topPoolsImage, data: <TopPools /> },
        { name: 'Range Positions', icon: rangePositionsImage, data: <SidebarRangePositions /> },
        { name: 'Limit Orders', icon: openOrdersImage, data: <SidebarLimitOrders /> },
    ];

    const navItems2 = [
        { name: 'Favorite Pools', icon: favouritePoolsImage, data: <FavoritePools /> },
    ];

    const navItems3 = [
        {
            name: 'Recent Transactions',
            icon: recentTransactionsImage,
            data: (
                <SidebarRecentTransactions
                    mostRecentTransactions={mostRecentTransactions}
                    coinGeckoTokenMap={coinGeckoTokenMap}
                    chainId={chainId}
                    isShowAllEnabled={isShowAllEnabled}
                    setIsShowAllEnabled={setIsShowAllEnabled}
                    currentClickedTxHashFromRecentTx={currentClickedTxHashFromRecentTx}
                    SetCurrentClickedTxHashFromRecentTx={SetCurrentClickedTxHashFromRecentTx}
                />
            ),
        },
    ];

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
                    <div onClick={() => setSwitchTabToTransactions(true)}>Recent Transactions</div>
                    {navItems1.map((item, idx) => (
                        <SidebarAccordion
                            showSidebar={showSidebar}
                            idx={idx}
                            item={item}
                            toggleSidebar={toggleSidebar}
                            key={idx}
                        />
                    ))}
                    <div className={styles.bottom_elements}>
                        {navItems2.map((item, idx) => (
                            <SidebarAccordion
                                toggleSidebar={toggleSidebar}
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                            />
                        ))}
                        {navItems3.map((item, idx) => (
                            <SidebarAccordion
                                toggleSidebar={toggleSidebar}
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                                mostRecentTransactions={mostRecentTransactions}
                            />
                        ))}
                    </div>
                </ul>
            </nav>
        </div>
    );
}

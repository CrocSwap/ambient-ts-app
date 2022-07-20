import styles from './Sidebar.module.css';
import React from 'react';
import { BiSearch } from 'react-icons/bi';
import { Link } from 'react-router-dom';
// import { MdDoubleArrow } from 'react-icons/md';
import favouritePoolsImage from '../../../assets/images/sidebarImages/favouritePools.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import topTokensImage from '../../../assets/images/sidebarImages/topTokens.svg';
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import SidebarAccordion from './SidebarAccordion';

import TopTokens from '../../../components/Global/Sidebar/TopTokens/TopTokens';
import TopPools from '../../../components/Global/Sidebar/TopPools/TopPools';
import FavoritePools from '../../../components/Global/Sidebar/FavoritePools/FavoritePools';
import SidebarRangePositions from '../../../components/Global/Sidebar/SidebarRangePositions/SidebarRangePositions';
import SidebarLimitOrders from '../../../components/Global/Sidebar/SidebarLimitOrders/SidebarLimitOrders';
import SidebarRecentTransactions from '../../../components/Global/Sidebar/SidebarRecentTransactions/SidebarRecentTransactions';
interface SidebarProps {
    // setShowSidebar: SetStateAction<boolean>;
    showSidebar: boolean;
    toggleSidebar: (
        event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLLIElement>,
    ) => void;
}

export default function Sidebar(props: SidebarProps): React.ReactElement<SidebarProps> {
    const { toggleSidebar, showSidebar } = props;

    const navItems1 = [
        { name: 'Top Tokens', icon: topTokensImage, data: <TopTokens /> },
        { name: 'Top Pools', icon: topPoolsImage, data: <TopPools /> },
        { name: 'Range Positions', icon: rangePositionsImage, data: <SidebarRangePositions /> },
        { name: 'Limit Orders', icon: openOrdersImage, data: <SidebarLimitOrders /> },
    ];

    const navItems2 = [
        { name: 'Favorite Pools', icon: favouritePoolsImage, data: <FavoritePools /> },
        {
            name: 'Recent Transactions',
            icon: recentTransactionsImage,
            data: <SidebarRecentTransactions />,
        },
    ];

    const sidebarFooter = (
        <div className={styles.sidebar_footer}>
            <Link to='/analytics'>
                <img src={topPoolsImage} alt='top tokens' />
                <p>Top Tokens</p>
            </Link>
            <Link to='/analytics'>
                <img src={topPoolsImage} alt='top pools' />
                <p>Top Pools</p>
            </Link>
            <Link to='/analytics'>
                <img src={rangePositionsImage} alt='range positions' />
                <p>Range Positions</p>
            </Link>
            <Link to='/analytics'>
                <img src={openOrdersImage} alt='Open Orders' />
                <p>Orders</p>
            </Link>
            <Link to='/analytics'>
                <img src={recentTransactionsImage} alt='recent transactions' />
                <p>Recent Positions</p>
            </Link>
        </div>
    );

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
                    {navItems1.map((item, idx) => (
                        //   <li key={idx} className={styles.sidebar_item}>
                        //  <div className={styles.sidebar_link}>
                        //      {showSidebar && <MdPlayArrow size={12} color='#ffffff' />}
                        //      <img src={item.icon} alt={item.name} width='20px' />

                        //      <span className={styles.link_text}>{item.name}</span>
                        //    </div>
                        // </li>
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
                            // <li key={idx} className={styles.sidebar_item} >
                            //     <div className={styles.sidebar_link}>
                            //         {showSidebar && <MdPlayArrow size={12} color='#ffffff' />}
                            //         <img src={item.icon} alt={item.name} width='20px' />

                            //         <span className={styles.link_text}>{item.name}</span>
                            //     </div>
                            // </li>
                            <SidebarAccordion
                                toggleSidebar={toggleSidebar}
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                            />
                        ))}
                    </div>
                </ul>
            </nav>
            {sidebarFooter}
        </div>
    );
}

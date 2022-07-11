import styles from './Sidebar.module.css';
import { BiSearch } from 'react-icons/bi';
import { MdDoubleArrow } from 'react-icons/md';
import favouritePoolsImage from '../../../assets/images/sidebarImages/favouritePools.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import topTokensImage from '../../../assets/images/sidebarImages/topTokens.svg';
import SidebarAccordion from './SidebarAccordion';

import TopTokens from '../../../components/Global/TopTokens/TopTokens';
import TopPools from '../../../components/Global/TopPools/TopPools';
import FavoritePools from '../../../components/Global/FavoritePools/FavoritePools';
import SidebarRangePositions from '../../../components/Global/SidebarRangePositions/SidebarRangePositions';
import SidebarLimitOrders from '../../../components/Global/SidebarLimitOrders/SidebarLimitOrders';
import SidebarRecentTransactions from '../../../components/Global/SidebarRecentTransactions/SidebarRecentTransactions';
interface SidebarProps {
    showSidebar: boolean;
    toggleSidebar: (event: React.MouseEvent<HTMLDivElement>) => void;
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

    const searchContainer = (
        <div className={styles.search_container}>
            <input
                type='text'
                id='box'
                placeholder='Search anything...'
                className={styles.search__box}
            />
            <div className={styles.search__icon}>
                <BiSearch size={20} color='#CDC1FF' />
            </div>
        </div>
    );

    const sidebarStyle = showSidebar ? styles.sidebar_active : styles.sidebar;
    return (
        <div>
            <nav className={`${styles.sidebar} ${sidebarStyle}`}>
                <ul className={styles.sidebar_nav}>
                    <li className={styles.logo}>
                        <div className={`${styles.sidebar_link} ${styles.toggle_sidebar_icon}`}>
                            <div onClick={toggleSidebar}>
                                <MdDoubleArrow size={20} color='#7371FC' />
                                {/* <img src={sidebarExpandImage} alt="" /> */}
                            </div>
                        </div>
                    </li>
                    {searchContainer}

                    {navItems1.map((item, idx) => (
                        <>
                            {/* <li key={idx} className={styles.sidebar_item}>
                            <div className={styles.sidebar_link}>
                                {showSidebar && <MdPlayArrow size={12} color='#ffffff' />}
                                <img src={item.icon} alt={item.name} width='20px' />

                                <span className={styles.link_text}>{item.name}</span>
                            </div>
                        </li> */}
                            <SidebarAccordion showSidebar={showSidebar} idx={idx} item={item} />
                        </>
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
                                showSidebar={showSidebar}
                                idx={idx}
                                item={item}
                                key={idx}
                            />
                        ))}
                    </div>
                </ul>
            </nav>
        </div>
    );
}

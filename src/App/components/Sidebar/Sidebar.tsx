import styles from './Sidebar.module.css';
import { BiSearch } from 'react-icons/bi';
import { MdPlayArrow, MdDoubleArrow } from 'react-icons/md';
import favouritePoolsImage from '../../../assets/images/sidebarImages/favouritePools.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import topTokensImage from '../../../assets/images/sidebarImages/topTokens.svg';

interface SidebarProps {
    showSidebar: boolean;
    toggleSidebar: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Sidebar(props: SidebarProps): React.ReactElement<SidebarProps> {
    const { toggleSidebar, showSidebar } = props;
    const navItems1 = [
        { name: 'Top Tokens', icon: topTokensImage },
        { name: 'Top Pools', icon: topPoolsImage },
        { name: 'Range Positions', icon: rangePositionsImage },
        { name: 'Open Orders', icon: openOrdersImage },
    ];

    const navItems2 = [
        { name: 'Favorite Pools', icon: favouritePoolsImage },
        { name: 'Recent Transactions', icon: recentTransactionsImage },
    ];

    const searchContainer = (
        <div className={styles.search_container}>
            <input
                type='text'
                id='box'
                placeholder='Search anything...'
                className={styles.search__box}
            />
            <div className={styles.search_icon}>
                <BiSearch size={20} color='#ffffff' />
            </div>
        </div>
    );

    const sidebarStyle = showSidebar ? styles.sidebar_active : styles.sidebar;
    return (
        <div>
            <nav className={`${styles.sidebar} ${sidebarStyle}`}>
                <ul className={styles.sidebar_nav}>
                    <li className={styles.logo}>
                        <div className={styles.sidebar_link}>
                            <div onClick={toggleSidebar}>
                                <MdDoubleArrow size={30} />
                            </div>
                        </div>
                    </li>
                    {searchContainer}

                    {navItems1.map((item, idx) => (
                        <li key={idx} className={styles.sidebar_item}>
                            <div className={styles.sidebar_link}>
                                <MdPlayArrow size={20} color='#ffffff' />
                                <img src={item.icon} alt={item.name} />

                                <span className={styles.link_text}>{item.name}</span>
                            </div>
                        </li>
                    ))}

                    <div className={styles.bottom_elements}>
                        {navItems2.map((item, idx) => (
                            <li key={idx} className={styles.sidebar_item} id='themeButton'>
                                <div className={styles.sidebar_link}>
                                    <MdPlayArrow size={20} color='#ffffff' />
                                    <img src={item.icon} alt={item.name} />

                                    <span className={styles.link_text}>{item.name}</span>
                                </div>
                            </li>
                        ))}
                    </div>
                </ul>
            </nav>
        </div>
    );
}

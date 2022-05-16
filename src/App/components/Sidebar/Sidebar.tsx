import styles from './Sidebar.module.css';
import { BiSearch } from 'react-icons/bi';
import { MdPlayArrow, MdDoubleArrow } from 'react-icons/md';

interface SidebarProps {
    showSidebar: boolean;
    toggleSidebar: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Sidebar(props: SidebarProps): React.ReactElement<SidebarProps> {
    const { toggleSidebar, showSidebar } = props;
    const navItems1 = [
        { name: 'Top Tokens' },
        { name: 'Top Pools' },
        { name: 'Range Positions' },
        { name: 'Open Orders' },
    ];

    const navItems2 = [{ name: 'Favorite Pools' }, { name: 'Recent Transactions' }];

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
                        <a href='#' className={styles.sidebar_link}>
                            <span className={`${styles.link_text} ${styles.logo_text}`}></span>
                            <div onClick={toggleSidebar}>
                                <MdDoubleArrow size={30} />
                            </div>
                        </a>
                    </li>
                    {searchContainer}

                    {navItems1.map((item, idx) => (
                        <li key={idx} className={styles.sidebar_item}>
                            <a href='#' className={styles.sidebar_link}>
                                <MdPlayArrow size={20} color='#ffffff' />

                                <span className={styles.link_text}>{item.name}</span>
                            </a>
                        </li>
                    ))}

                    <div className={styles.bottom_elements}>
                        {navItems2.map((item, idx) => (
                            <li key={idx} className={styles.sidebar_item} id='themeButton'>
                                <a href='#' className={styles.sidebar_link}>
                                    <MdPlayArrow size={20} color='#ffffff' />

                                    <span className={styles.link_text}>{item.name}</span>
                                </a>
                            </li>
                        ))}
                    </div>
                </ul>
            </nav>
        </div>
    );
}

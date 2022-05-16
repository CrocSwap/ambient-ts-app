import styles from './Sidebar.module.css';
import { BiSearch } from 'react-icons/bi';
import { MdPlayArrow } from 'react-icons/md';

export default function Sidebar() {
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

    return (
        <div>
            <nav className={styles.navbar}>
                <ul className={styles.navbar_nav}>
                    <li className={styles.logo}>
                        <a href='#' className={styles.nav_link}>
                            <span className={`${styles.link_text} ${styles.logo_text}`}></span>
                            <svg
                                aria-hidden='true'
                                focusable='false'
                                data-prefix='fad'
                                data-icon='angle-double-right'
                                role='img'
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 448 512'
                                className='svg-inline--fa fa-angle-double-right fa-w-14 fa-5x'
                            >
                                <g className='fa-group'>
                                    <path
                                        fill='currentColor'
                                        d='M224 273L88.37 409a23.78 23.78 0 0 1-33.8 0L32 386.36a23.94 23.94 0 0 1 0-33.89l96.13-96.37L32 159.73a23.94 23.94 0 0 1 0-33.89l22.44-22.79a23.78 23.78 0 0 1 33.8 0L223.88 239a23.94 23.94 0 0 1 .1 34z'
                                        className='fa-secondary'
                                    ></path>
                                    <path
                                        fill='currentColor'
                                        d='M415.89 273L280.34 409a23.77 23.77 0 0 1-33.79 0L224 386.26a23.94 23.94 0 0 1 0-33.89L320.11 256l-96-96.47a23.94 23.94 0 0 1 0-33.89l22.52-22.59a23.77 23.77 0 0 1 33.79 0L416 239a24 24 0 0 1-.11 34z'
                                        className='fa-primary'
                                    ></path>
                                </g>
                            </svg>
                        </a>
                    </li>
                    {searchContainer}

                    {navItems1.map((item, idx) => (
                        <li key={idx} className={styles.nav_item}>
                            <a href='#' className={styles.nav_link}>
                                <MdPlayArrow size={20} color='#ffffff' />

                                <span className={styles.link_text}>{item.name}</span>
                            </a>
                        </li>
                    ))}

                    <div className={styles.bottom_elements}>
                        {navItems2.map((item, idx) => (
                            <li key={idx} className={styles.nav_item} id='themeButton'>
                                <a href='#' className={styles.nav_link}>
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

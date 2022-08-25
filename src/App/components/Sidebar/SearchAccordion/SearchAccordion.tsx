// START: Import React and Dongles
import { useEffect, useState, SetStateAction, Dispatch, MouseEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch } from 'react-icons/bi';
import { MdPlayArrow } from 'react-icons/md';

// START: Import Local Files
import styles from '../Sidebar.module.css';
import closeSidebarImage from '../../../../assets/images/sidebarImages/closeSidebar.svg';
import SidebarSearchResults from '../SidebarSearchResults/SidebarSearchResults';
import formatSearchText from '../formatSeachText';

// interface for React functional component props
interface SearchAccordionPropsIF {
    children?: ReactNode;
    showSidebar: boolean;
    toggleSidebar: (event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>) => void;
    setSearchMode: Dispatch<SetStateAction<boolean>>;
    searchMode?: boolean;
    handleSearchModeToggle: () => void;
}

// react functional component
export default function SearchAccordion(props: SearchAccordionPropsIF) {
    const { showSidebar, toggleSidebar, searchMode, setSearchMode } = props;
    const [searchInput, setSearchInput] = useState<string[][]>();

    const searchInputChangeHandler = (event: string) => {
        const formatText = formatSearchText(event);

        setSearchInput(formatText);
    };

    const searchContainer = (
        <div className={styles.main_search_container}>
            <div className={styles.search_container}>
                <div className={styles.search__icon} onClick={toggleSidebar}>
                    <BiSearch size={18} color='#CDC1FF' />
                </div>
                <input
                    type='text'
                    id='box'
                    placeholder='Search anything...'
                    className={styles.search__box}
                    onFocus={() => setSearchMode(true)}
                    // onBlur={() => setSearchMode(false)}
                    onChange={(e) => searchInputChangeHandler(e.target.value)}
                />
            </div>
        </div>
    );

    // This is to prevent the sidebar items from rendering their contents when the sidebar is closed

    return (
        <>
            <motion.li
                className={styles.sidebar_item}
                // onClick={showSidebar ? searchModeToggle : toggleSidebar}
            >
                <div className={`${styles.sidebar_link} ${styles.sidebar_link_search}`}>
                    {searchContainer}

                    <div>
                        <img src={closeSidebarImage} alt='close sidebar' onClick={toggleSidebar} />
                    </div>
                </div>
            </motion.li>
            {/* <AnimatePresence>{isOpen && showOpenContentOrNull}</AnimatePresence> */}
        </>
    );
}

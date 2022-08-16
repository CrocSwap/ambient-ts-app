// import styles from './SidebarAccordion.module.css';
import { MdPlayArrow } from 'react-icons/md';
import styles from '../Sidebar.module.css';
import { BiSearch } from 'react-icons/bi';
import closeSidebarImage from '../../../../assets/images/sidebarImages/closeSidebar.svg';

import { useEffect, useState, SetStateAction, Dispatch } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarSearchResults from '../SidebarSearchResults/SidebarSearchResults';

import formatSearchText from '../formatSeachText';

interface SearchAccordionProps {
    children?: React.ReactNode;
    showSidebar: boolean;
    toggleSidebar: (
        event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLLIElement>,
    ) => void;

    setSearchMode: Dispatch<SetStateAction<boolean>>;
    searchMode?: boolean;
    handleSearchModeToggle: () => void;
}

export default function SearchAccordion(props: SearchAccordionProps) {
    const { showSidebar, toggleSidebar, searchMode, setSearchMode } = props;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [searchInput, setSearchInput] = useState<string[][]>();
    useEffect(() => {
        if (!showSidebar) {
            setIsOpen(false);
        }
    }, [showSidebar]);

    const searchInputChangeHandler = (event: string) => {
        const formatText = formatSearchText(event);

        setSearchInput(formatText);
    };

    const searchContainer = (
        <div className={styles.main_search_container}>
            <div className={styles.search_container}>
                <div
                    className={styles.search__icon}
                    // onClick={toggleSidebar}
                >
                    <BiSearch size={18} color='#CDC1FF' />
                </div>
                <input
                    type='text'
                    id='box'
                    placeholder='Search anything...'
                    className={styles.search__box}
                    onChange={(e) => searchInputChangeHandler(e.target.value)}
                />
            </div>
        </div>
    );

    const searchContent = (
        <div className={styles.search_result}>
            {searchContainer}
            {searchInput && <SidebarSearchResults searchInput={searchInput} />}
        </div>
    );

    const openStateContent = (
        <motion.div
            className={styles.accordion_container}
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
            <div className={styles.sidebar_item_content}>{searchContent}</div>
        </motion.div>
    );

    // This is to prevent the sidebar items from rendering their contents when the sidebar is closed
    const showOpenContentOrNull = showSidebar ? openStateContent : '';

    const sidebarIconStyle = isOpen ? styles.open_link : null;

    function searchModeToggle() {
        setSearchMode(!searchMode);
        setIsOpen(!isOpen);
    }

    return (
        <>
            <motion.li
                className={styles.sidebar_item}
                // onClick={showSidebar ? searchModeToggle : toggleSidebar}
            >
                <div className={`${styles.sidebar_link} ${styles.sidebar_link_search}`}>
                    <div
                        className={styles.align_center}
                        onClick={showSidebar ? searchModeToggle : toggleSidebar}
                    >
                        {showSidebar && (
                            <MdPlayArrow size={12} color='#ffffff' className={sidebarIconStyle} />
                        )}

                        {!isOpen && <BiSearch color='#CDC1FF' size={20} />}

                        <span className={styles.link_text}>Search</span>
                    </div>

                    <div>
                        <img src={closeSidebarImage} alt='close sidebar' onClick={toggleSidebar} />
                    </div>
                </div>
            </motion.li>
            <AnimatePresence>{isOpen && showOpenContentOrNull}</AnimatePresence>
        </>
    );
}

// import styles from './SidebarAccordion.module.css';
import { MdPlayArrow } from 'react-icons/md';
import styles from './Sidebar.module.css';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ISwap } from '../../../utils/state/graphDataSlice';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
interface Item {
    name: string;
    icon: string;
    data: React.ReactNode;
}

interface SidebarAccordionProps {
    children?: React.ReactNode;
    showSidebar: boolean;
    toggleSidebar: (
        event: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLLIElement>,
    ) => void;
    item: Item;
    idx: number;
    mostRecent?: PositionIF[] | ISwap[] | string[];
}

export default function SidebarAccordion(props: SidebarAccordionProps) {
    const { showSidebar, idx, item, toggleSidebar, mostRecent = [] } = props;

    const userHasRecent = mostRecent.length > 0;

    const [isOpen, setIsOpen] = useState(userHasRecent);

    useEffect(() => {
        if (userHasRecent) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [userHasRecent]);

    useEffect(() => {
        if (mostRecent.length > 0) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [JSON.stringify(mostRecent)]);

    // console.log(showSidebar);
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
            <div className={styles.sidebar_item_content}>{item.data}</div>
        </motion.div>
    );

    // This is to prevent the sidebar items from rendering their contents when the sidebar is closed
    const showOpenContentOrNull = showSidebar ? openStateContent : '';

    const sidebarIconStyle = isOpen ? styles.open_link : null;

    return (
        <>
            <motion.li
                key={idx}
                className={styles.sidebar_item}
                onClick={showSidebar ? () => setIsOpen(!isOpen) : toggleSidebar}
            >
                <div className={styles.sidebar_link}>
                    {showSidebar && (
                        <MdPlayArrow size={12} color='#ffffff' className={sidebarIconStyle} />
                    )}
                    <img src={item.icon} alt={item.name} width='20px' />

                    <span className={styles.link_text}>{item.name}</span>
                </div>
            </motion.li>
            <AnimatePresence>{isOpen && showOpenContentOrNull}</AnimatePresence>
        </>
    );
}

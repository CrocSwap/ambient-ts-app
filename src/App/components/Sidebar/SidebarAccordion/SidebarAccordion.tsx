// START: Import React and Dongles
import { useState, ReactNode, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlayArrow } from 'react-icons/md';
// START: Import Local Files
import styles from '../Sidebar.module.css';
import { useAccount } from 'wagmi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { IS_LOCAL_ENV } from '../../../../constants';
import { sidebarMethodsIF } from '../../../hooks/useSidebar';
import { AppStateContext } from '../../../../contexts/AppStateContext';

// interface for React functional component props
interface propsIF {
    children?: ReactNode;
    shouldDisplayContentWhenUserNotLoggedIn: boolean;
    isDefaultOverridden: boolean;
    item: {
        name: string;
        icon: string;
        data: ReactNode;
    };
    idx: number | string;
    openAllDefault?: boolean;
    sidebar: sidebarMethodsIF;
}

export default function SidebarAccordion(props: propsIF) {
    const {
        shouldDisplayContentWhenUserNotLoggedIn,
        idx,
        item,
        isDefaultOverridden,
        sidebar,
    } = props;

    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const { isConnected } = useAccount();
    const isTopPools = item.name === 'Top Pools';

    const [isOpen, setIsOpen] = useState(isTopPools);

    useEffect(() => {
        if (isTopPools) {
            IS_LOCAL_ENV && console.debug({ isOpen });
        }
    }, [isTopPools, isOpen]);
    const overflowSidebarMQ = useMediaQuery('(max-width: 1280px)');

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
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 1] }}
        >
            <div
                className={styles.sidebar_item_content}
                onClick={overflowSidebarMQ ? () => sidebar.close() : undefined}
            >
                {item.data}
            </div>
        </motion.div>
    );

    // prevent sidebar items from rendering their contents when the sidebar is closed
    const showOpenContentOrNull = sidebar.isOpen ? openStateContent : '';

    const sidebarIconStyle = isOpen ? styles.open_link : null;

    function handleAccordionClick() {
        if (sidebar.isOpen) {
            setIsOpen(!isOpen);
        } else {
            setIsOpen(true);
            sidebar.open();
        }
        IS_LOCAL_ENV && console.debug('clicked');
    }

    useEffect(() => {
        if (isDefaultOverridden) {
            if (props.openAllDefault) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        }
    }, [props.openAllDefault, isDefaultOverridden]);

    const accordionContentToShow =
        !isConnected &&
        !shouldDisplayContentWhenUserNotLoggedIn &&
        sidebar.isOpen ? (
            <div className={styles.connect_button}>
                <p>Your recent {item.name.toLowerCase()} will display here.</p>
                <button onClick={openWagmiModal}>Connect Wallet</button>
            </div>
        ) : (
            showOpenContentOrNull
        );

    return (
        <>
            <motion.li
                key={idx}
                className={styles.sidebar_item}
                onClick={() => handleAccordionClick()}
            >
                <div>
                    <div
                        className={styles.sidebar_link}
                        style={{
                            justifyContent: !sidebar.isOpen
                                ? 'center'
                                : 'flex-start',
                        }}
                    >
                        {sidebar.isOpen && (
                            <MdPlayArrow
                                size={12}
                                className={sidebarIconStyle}
                            />
                        )}
                        <img src={item.icon} alt={item.name} width='20px' />

                        <span className={styles.link_text}>{item.name}</span>
                    </div>
                </div>
            </motion.li>
            <AnimatePresence>
                {isOpen && accordionContentToShow}
            </AnimatePresence>
        </>
    );
}

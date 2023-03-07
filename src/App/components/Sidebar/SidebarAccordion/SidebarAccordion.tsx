// START: Import React and Dongles
import { useState, MouseEvent, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlayArrow } from 'react-icons/md';
// import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
// START: Import Local Files
// import notificationStyles from './SidebarAccordion.module.css'
import styles from '../Sidebar.module.css';
import { useAccount } from 'wagmi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
// import { PositionIF } from '../../../../utils/interfaces/exports';
// import { CircleLoader } from '../../../../components/Global/LoadingAnimations/CircleLoader/CircleLoader';
// import { AiFillBell } from 'react-icons/ai'

// interface for React functional component props
interface propsIF {
    children?: ReactNode;
    showSidebar: boolean;
    setShowSidebar: Dispatch<SetStateAction<boolean>>;
    shouldDisplayContentWhenUserNotLoggedIn: boolean;

    openModalWallet: () => void;
    isDefaultOverridden: boolean;
    toggleSidebar: (event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>) => void;
    item: {
        name: string;
        icon: string;
        data: ReactNode;
    };
    idx: number | string;
    openAllDefault?: boolean;
}

export default function SidebarAccordion(props: propsIF) {
    const {
        showSidebar,
        shouldDisplayContentWhenUserNotLoggedIn,
        idx,
        item,
        setShowSidebar,
        openModalWallet,
        isDefaultOverridden,
    } = props;

    const { isConnected } = useAccount();
    const isTopPools = item.name === 'Top Pools';

    const [isOpen, setIsOpen] = useState(isTopPools);

    useEffect(() => {
        if (isTopPools) {
            console.log({ isOpen });
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
                onClick={overflowSidebarMQ ? () => setShowSidebar(false) : undefined}
            >
                {item.data}
            </div>
        </motion.div>
    );

    // This is to prevent the sidebar items from rendering their contents when the sidebar is closed
    const showOpenContentOrNull = showSidebar ? openStateContent : '';

    const sidebarIconStyle = isOpen ? styles.open_link : null;

    // const notificationBell = (
    //     <div className={notificationStyles.notification_bell}>
    //         <div className={notificationStyles.bell_icon}><AiFillBell /></div>
    //         <div className={notificationStyles.number}>3</div>
    //     </div>
    // )
    // console.log(props.openAllDefault);
    function handleAccordionClick() {
        if (showSidebar) {
            setIsOpen(!isOpen);
        } else {
            setIsOpen(true);
            setShowSidebar(true);
        }
        console.log('clicked');
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
        !isConnected && !shouldDisplayContentWhenUserNotLoggedIn && showSidebar ? (
            <div className={styles.connect_button}>
                <p>Your recent {item.name.toLowerCase()} will display here.</p>
                <button onClick={openModalWallet}>Connect Wallet</button>
            </div>
        ) : (
            showOpenContentOrNull
        );

    return (
        <>
            <motion.li
                key={idx}
                className={styles.sidebar_item}
                onClick={
                    // showSidebar ? () => setIsOpen(!isOpen) : toggleSidebar
                    () => handleAccordionClick()
                }
            >
                <div>
                    <div className={styles.sidebar_link}>
                        {showSidebar && <MdPlayArrow size={12} className={sidebarIconStyle} />}
                        <img src={item.icon} alt={item.name} width='20px' />

                        <span className={styles.link_text}>{item.name}</span>
                    </div>
                    {/* <CircleLoader size='10px' /> */}
                    {/* { notificationBell} */}
                </div>
            </motion.li>
            <AnimatePresence>{isOpen && accordionContentToShow}</AnimatePresence>
        </>
    );
}

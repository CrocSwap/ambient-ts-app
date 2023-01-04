// START: Import React and Dongles
import { useState, MouseEvent, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlayArrow } from 'react-icons/md';
// import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
// START: Import Local Files
// import notificationStyles from './SidebarAccordion.module.css'
import styles from '../Sidebar.module.css';
import { useAccount } from 'wagmi';
// import { ITransaction } from '../../../../utils/state/graphDataSlice';
// import { PositionIF } from '../../../../utils/interfaces/PositionIF';
// import { CircleLoader } from '../../../../components/Global/LoadingAnimations/CircleLoader/CircleLoader';
// import { AiFillBell } from 'react-icons/ai'

// interface for React functional component props
interface SidebarAccordionPropsIF {
    children?: ReactNode;
    showSidebar: boolean;
    setShowSidebar: Dispatch<SetStateAction<boolean>>;
    shouldDisplayContentWhenUserNotLoggedIn: boolean;

    openModalWallet: () => void;

    toggleSidebar: (event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLLIElement>) => void;
    item: {
        name: string;
        icon: string;
        data: ReactNode;
    };
    idx: number | string;
    openAllDefault?: boolean;
    // mostRecent?: PositionIF[] | ITransaction[] | string[];
}

export default function SidebarAccordion(props: SidebarAccordionPropsIF) {
    const {
        showSidebar,
        shouldDisplayContentWhenUserNotLoggedIn,
        idx,
        item,
        setShowSidebar,
        openModalWallet,
    } = props;

    const { isConnected } = useAccount();

    const isUserLoggedIn = isConnected;
    // const isUserLoggedIn = useAppSelector((state) => state.userData).isLoggedIn;

    const [isOpen, setIsOpen] = useState(false);

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

    // const notificationBell = (
    //     <div className={notificationStyles.notification_bell}>
    //         <div className={notificationStyles.bell_icon}><AiFillBell /></div>
    //         <div className={notificationStyles.number}>3</div>
    //     </div>
    // )
    // console.log(props.openAllDefault);
    function handleAccordionOpen() {
        setIsOpen(!isOpen);
        setShowSidebar(true);
    }

    useEffect(() => {
        setIsOpen(false);
        if (props.openAllDefault) {
            setIsOpen(true);
        }
    }, [props.openAllDefault]);
    // if (props.openAllDefault){setIsOpen(true)}

    const accordionContentToShow =
        isUserLoggedIn || shouldDisplayContentWhenUserNotLoggedIn ? (
            showOpenContentOrNull
        ) : (
            <div className={styles.connect_button}>
                <p>Your recent {item.name.toLowerCase()} will display here.</p>
                <button onClick={openModalWallet}>Connect Wallet</button>
            </div>
        );

    return (
        <>
            <motion.li
                key={idx}
                className={styles.sidebar_item}
                onClick={
                    // showSidebar ? () => setIsOpen(!isOpen) : toggleSidebar
                    () => handleAccordionOpen()
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

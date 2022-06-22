import styles from './DropdownMenu.module.css';
import { useState, useRef } from 'react';
import '../../../App.css';
import { BiArrowBack } from 'react-icons/bi';
import { FiSettings, FiMoreHorizontal } from 'react-icons/fi';
import { CSSTransition } from 'react-transition-group';
import { FaNetworkWired, FaDiscord, FaSun, FaGithub } from 'react-icons/fa';
import { MdHelp, MdArrowForwardIos, MdLanguage, MdReportProblem } from 'react-icons/md';
import { motion } from 'framer-motion';
import arbitrumImage from '../../../../assets/images/networks/arbitrum.svg';
import kovanImage from '../../../../assets/images/networks/kovan.svg';
import optimisticImage from '../../../../assets/images/networks/optimistic.svg';
import polygonImage from '../../../../assets/images/networks/polygon.svg';
import ethereumImage from '../../../../assets/images/networks/ethereum.png';

import { HiOutlineDocumentText } from 'react-icons/hi';

import { GoRequestChanges } from 'react-icons/go';
import { BsBook, BsMedium } from 'react-icons/bs';
import { AiFillTwitterCircle, AiFillInfoCircle } from 'react-icons/ai';

// networks

interface DropdownItemProps {
    goToMenu?: string;
    leftIcon?: React.ReactNode | string;
    topLevel?: boolean;
    goBackItem?: boolean;
    imageIcon?: string;

    children: React.ReactNode;
    rightIcon?: React.ReactNode;
}

interface DropdownMenuProps {
    isAuthenticated?: boolean;
    isWeb3Enabled?: boolean;
    clickLogout: () => void;
}

export default function DropdownMenu(props: DropdownMenuProps) {
    const { isAuthenticated, isWeb3Enabled, clickLogout } = props;

    const [activeMenu, setActiveMenu] = useState('main');
    // eslint-disable-next-line
    const [menuHeight, setMenuHeight] = useState(null);
    const dropdownRef = useRef(null);

    // useEffect(() => {
    //     setMenuHeight(dropdownRef.current?.firstChild.offsetHeight);
    // }, []);

    // eslint-disable-next-line
    function calcHeight(el: any) {
        const height = el.offsetHeight;
        setMenuHeight(height);
    }

    function DropdownItem(props: DropdownItemProps) {
        const topLevelItemStyle = props.topLevel
            ? styles.topLevelContainer
            : styles.nonTopLevelContainer;
        const goBackItemStyle = props.goBackItem ? styles.goBackStyle : null;

        const imageIcon = (
            <img src={props.imageIcon} alt='icon' className={styles.icon_button} width='25px' />
        );

        const itemIcon = <div className={styles.icon_button}>{props.leftIcon}</div>;

        return (
            <>
                <a
                    href='#'
                    className={`${styles.menu_item} ${topLevelItemStyle} ${goBackItemStyle}`}
                    onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
                >
                    {props.imageIcon && imageIcon}
                    {props.leftIcon && itemIcon}
                    {props.children}
                    <span className={styles.icon_right}>{props.rightIcon}</span>
                </a>
            </>
        );
    }

    const networksItems = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <DropdownItem imageIcon={kovanImage}>Kovan</DropdownItem>
            <DropdownItem imageIcon={ethereumImage}>Ropsten</DropdownItem>
            <DropdownItem imageIcon={ethereumImage}>Ethereum</DropdownItem>
            <DropdownItem imageIcon={polygonImage}>Polygon</DropdownItem>
            <DropdownItem imageIcon={optimisticImage}>Optimism</DropdownItem>
            <DropdownItem imageIcon={arbitrumImage}>Arbitrum</DropdownItem>
        </motion.div>
    );

    const socialsItems = (
        <>
            <DropdownItem leftIcon={<AiFillTwitterCircle size={20} />}>Twitter</DropdownItem>
            <DropdownItem leftIcon={<FaDiscord size={20} />}>Discord</DropdownItem>
            <DropdownItem leftIcon={<BsMedium size={20} />}>Medium</DropdownItem>
            <DropdownItem leftIcon={<FaGithub size={20} />}>Github</DropdownItem>
        </>
    );

    const logoutButton = (
        <button className={styles.authenticate_button} onClick={clickLogout}>
            Logout
        </button>
    );

    const settingsItems = (
        <>
            <DropdownItem leftIcon={<FaSun size={20} />}>Light Mode</DropdownItem>
            <DropdownItem leftIcon={<MdLanguage size={20} />}>Language</DropdownItem>
            <DropdownItem leftIcon={<HiOutlineDocumentText size={20} />}>
                Legal & Privacy
            </DropdownItem>

            {isAuthenticated && isWeb3Enabled && (
                <div className={styles.button_container}>{logoutButton}</div>
            )}
        </>
    );

    const supportItems = (
        <>
            <DropdownItem leftIcon={<MdHelp size={20} />}>Help Center</DropdownItem>
            <DropdownItem leftIcon={<MdReportProblem size={20} />}>Report a Problem</DropdownItem>
            <DropdownItem leftIcon={<GoRequestChanges size={20} />}>Request Features</DropdownItem>
        </>
    );

    const moreItems = (
        <>
            <DropdownItem leftIcon={<AiFillInfoCircle size={20} />}>About</DropdownItem>
            <DropdownItem leftIcon={<BsBook size={20} />}>Docs</DropdownItem>
        </>
    );

    const dropdownItemData = [
        {
            title: 'Networks',
            data: networksItems,
            leftIcon: <FaNetworkWired size={20} />,
        },
        {
            title: 'Settings & Privacy',
            data: settingsItems,
            leftIcon: <FiSettings size={20} />,
        },
        {
            title: 'Help & Support',
            data: supportItems,
            leftIcon: <MdHelp size={20} />,
        },
        {
            title: 'Socials',
            data: socialsItems,
            leftIcon: <FaDiscord size={20} />,
        },
        {
            title: 'More',
            data: moreItems,
            leftIcon: <FiMoreHorizontal size={20} />,
        },
    ];

    return (
        <div
            className={styles.dropdown}
            // style={{ height: menuHeight }}
            ref={dropdownRef}
        >
            <CSSTransition
                in={activeMenu === 'main'}
                unmountOnExit
                timeout={500}
                classNames='menu-primary'
                onEnter={calcHeight}
            >
                {/* Menu with each drop down item */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={styles.menu}
                >
                    {dropdownItemData.map((item) => (
                        <DropdownItem
                            key={item.title}
                            leftIcon={item.leftIcon ? item.leftIcon : ''}
                            rightIcon={<MdArrowForwardIos />}
                            goToMenu={item.title}
                            topLevel
                        >
                            {item.title}
                        </DropdownItem>
                    ))}
                </motion.div>
            </CSSTransition>

            {/* Dropdown item datathat will slide in when clicked */}

            {dropdownItemData.map((item) => (
                <CSSTransition
                    in={activeMenu === item.title}
                    unmountOnExit
                    key={item.title}
                    timeout={500}
                    classNames='menu-secondary'
                    onEnter={calcHeight}
                >
                    <div className={styles.menu}>
                        <DropdownItem goToMenu='main' leftIcon={<BiArrowBack />} goBackItem>
                            <h3>{item.title}</h3>
                        </DropdownItem>
                        {item.data}
                    </div>
                </CSSTransition>
            ))}
        </div>
    );
}

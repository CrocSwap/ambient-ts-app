import styles from './NavbarDropdownMenu.module.css';
import { useState, useRef } from 'react';
import '../../../App.css';
import { BiArrowBack } from 'react-icons/bi';
import { FiSettings, FiMoreHorizontal } from 'react-icons/fi';
import { CSSTransition } from 'react-transition-group';
import { FaNetworkWired, FaDiscord, FaSun, FaGithub, FaDotCircle } from 'react-icons/fa';
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

interface NavbarDropdownItemProps {
    goToMenu?: string;
    leftIcon?: React.ReactNode | string;
    topLevel?: boolean;
    goBackItem?: boolean;
    imageIcon?: string;
    onClick?: () => void;
    children: React.ReactNode;
    rightIcon?: React.ReactNode;
}

interface NavbarDropdownMenuProps {
    isAuthenticated?: boolean;
    isWeb3Enabled?: boolean;
    clickLogout: () => void;
    openModal: () => void;
    closeMenu?: () => void;
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
}

export default function NavbarDropdownMenu(props: NavbarDropdownMenuProps) {
    const {
        isAuthenticated,
        isWeb3Enabled,
        clickLogout,
        openModal,
        closeMenu,
        chainId,
        setFallbackChainId,
    } = props;
    // console.log(props.closeMenu);

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

    function NavbarDropdownItem(props: NavbarDropdownItemProps) {
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
                <div
                    className={`${styles.menu_item} ${topLevelItemStyle} ${goBackItemStyle}`}
                    onClick={() => {
                        props.goToMenu && setActiveMenu(props.goToMenu);
                        if (props.onClick) props.onClick();
                    }}
                >
                    {props.imageIcon && imageIcon}
                    {props.leftIcon && itemIcon}
                    {props.children}
                    <span className={styles.icon_right}>{props.rightIcon}</span>
                </div>
            </>
        );
    }

    const circleIcon = <FaDotCircle color='#CDC1FF' size={10} />;

    const networksItems = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <NavbarDropdownItem
                imageIcon={kovanImage}
                rightIcon={chainId === '0x2a' ? circleIcon : null}
                onClick={() => setFallbackChainId('0x2a')}
            >
                Kovan
            </NavbarDropdownItem>
            <NavbarDropdownItem
                imageIcon={ethereumImage}
                rightIcon={chainId === '0x3' ? circleIcon : null}
                onClick={() => setFallbackChainId('0x3')}
            >
                Ropsten
            </NavbarDropdownItem>
            <NavbarDropdownItem
                imageIcon={ethereumImage}
                rightIcon={chainId === '0x1' ? circleIcon : null}
                onClick={() => setFallbackChainId('0x1')}
            >
                Ethereum
            </NavbarDropdownItem>
            <NavbarDropdownItem
                imageIcon={polygonImage}
                rightIcon={chainId === '0x89' ? circleIcon : null}
                onClick={() => setFallbackChainId('0x89')}
            >
                Polygon
            </NavbarDropdownItem>
            <NavbarDropdownItem
                imageIcon={optimisticImage}
                rightIcon={chainId === '0xa86a' ? circleIcon : null}
                onClick={() => setFallbackChainId('0xa86a')}
            >
                Avalanche
            </NavbarDropdownItem>
            <NavbarDropdownItem
                imageIcon={arbitrumImage}
                rightIcon={chainId === '0xa869' ? circleIcon : null}
                onClick={() => setFallbackChainId('0xa869')}
            >
                Fuji
            </NavbarDropdownItem>
        </motion.div>
    );

    const socialsItems = (
        <>
            <NavbarDropdownItem leftIcon={<AiFillTwitterCircle size={20} />}>
                Twitter
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<FaDiscord size={20} />}>Discord</NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<BsMedium size={20} />}>Medium</NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<FaGithub size={20} />}>Github</NavbarDropdownItem>
        </>
    );

    function handleLogout() {
        clickLogout();
        closeMenu ? closeMenu() : null;
    }
    function handleLoginWithEmail() {
        openModal();
        closeMenu ? closeMenu() : null;
    }

    const logoutButton = (
        <div className={styles.button_container} onClick={handleLogout}>
            <button className={styles.authenticate_button}>Logout</button>
        </div>
    );
    const magicButton = (
        <div className={styles.button_container} onClick={handleLoginWithEmail}>
            <button className={styles.authenticate_button}>Log in with Email</button>
        </div>
    );

    const settingsItems = (
        <>
            <NavbarDropdownItem leftIcon={<FaSun size={20} />}>Light Mode</NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<MdLanguage size={20} />}>Language</NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<HiOutlineDocumentText size={20} />}>
                Legal & Privacy
            </NavbarDropdownItem>

            {isAuthenticated && isWeb3Enabled && logoutButton}

            {(!isAuthenticated || !isWeb3Enabled) && magicButton}
        </>
    );

    const supportItems = (
        <>
            <NavbarDropdownItem leftIcon={<MdHelp size={20} />}>Help Center</NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<MdReportProblem size={20} />}>
                Report a Problem
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<GoRequestChanges size={20} />}>
                Request Features
            </NavbarDropdownItem>
        </>
    );

    const moreItems = (
        <>
            <NavbarDropdownItem leftIcon={<AiFillInfoCircle size={20} />}>About</NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<BsBook size={20} />}>Docs</NavbarDropdownItem>
        </>
    );

    const NavbardropdownItemData = [
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
                    {NavbardropdownItemData.map((item) => (
                        <NavbarDropdownItem
                            key={item.title}
                            leftIcon={item.leftIcon ? item.leftIcon : ''}
                            rightIcon={<MdArrowForwardIos />}
                            goToMenu={item.title}
                            topLevel
                        >
                            {item.title}
                        </NavbarDropdownItem>
                    ))}
                </motion.div>
            </CSSTransition>

            {/* Dropdown item datathat will slide in when clicked */}

            {NavbardropdownItemData.map((item) => (
                <CSSTransition
                    in={activeMenu === item.title}
                    unmountOnExit
                    key={item.title}
                    timeout={500}
                    classNames='menu-secondary'
                    onEnter={calcHeight}
                >
                    <div className={styles.menu}>
                        <NavbarDropdownItem goToMenu='main' leftIcon={<BiArrowBack />} goBackItem>
                            <h3>{item.title}</h3>
                        </NavbarDropdownItem>
                        {item.data}
                    </div>
                </CSSTransition>
            ))}
        </div>
    );
}

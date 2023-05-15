// START: Import React and Dongles
import {
    ReactNode,
    useState,
    useRef,
    useEffect,
    useContext,
    memo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CSSTransition } from 'react-transition-group';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { BiArrowBack, BiMessageCheck } from 'react-icons/bi';
import { BsBook, BsMedium } from 'react-icons/bs';
import { FiSettings } from 'react-icons/fi';
import { FaDiscord, FaGithub, FaDotCircle } from 'react-icons/fa';
import { GoRequestChanges } from 'react-icons/go';
import { HiOutlineDocumentText, HiDocumentDuplicate } from 'react-icons/hi';
import FocusTrap from 'focus-trap-react';

import {
    MdHelp,
    MdArrowForwardIos,
    MdLanguage,
    MdReportProblem,
} from 'react-icons/md';
import { RiErrorWarningLine } from 'react-icons/ri';

import '../../../App.css';
import styles from './NavbarDropdownMenu.module.css';
import useKeyPress from '../../../hooks/useKeyPress';
import { AppStateContext } from '../../../../contexts/AppStateContext';

interface NavbarDropdownItemPropsIF {
    goToMenu?: string;
    leftIcon?: ReactNode | string;
    topLevel?: boolean;
    goBackItem?: boolean;
    imageIcon?: string;
    onClick?: () => void;

    children: ReactNode;
    rightIcon?: ReactNode;
}

interface NavbarDropdownMenuPropsIF {
    isUserLoggedIn: boolean | undefined;
    clickLogout: () => void;
    closeMenu?: () => void;
    setIsNavbarMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavbarDropdownMenu(props: NavbarDropdownMenuPropsIF) {
    const { isUserLoggedIn, clickLogout, closeMenu, setIsNavbarMenuOpen } =
        props;

    const {
        tutorial: { isActive: isTutorialMode, setIsActive: setIsTutorialMode },
    } = useContext(AppStateContext);

    const navigate = useNavigate();

    const { i18n } = useTranslation();

    const [activeMenu, setActiveMenu] = useState('main');
    const dropdownRef = useRef(null);

    const isEscapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (isEscapePressed) {
            setIsNavbarMenuOpen(false);
        }
    }, [isEscapePressed]);

    function NavbarDropdownItem(props: NavbarDropdownItemPropsIF) {
        const topLevelItemStyle = props.topLevel
            ? styles.topLevelContainer
            : styles.nonTopLevelContainer;
        const goBackItemStyle = props.goBackItem ? styles.goBackStyle : null;

        const imageIcon = (
            <img
                src={props.imageIcon}
                alt='icon'
                className={styles.icon_button}
                width='25px'
            />
        );

        const itemIcon = (
            <div className={styles.icon_button}>{props.leftIcon}</div>
        );

        return (
            <button
                className={`${styles.menu_item} ${topLevelItemStyle} ${goBackItemStyle}`}
                onClick={() => {
                    props.goToMenu && setActiveMenu(props.goToMenu);
                    if (props.onClick) props.onClick();
                }}
                tabIndex={0}
                role='button'
            >
                {props.imageIcon && imageIcon}
                {props.leftIcon && itemIcon}
                {props.children}

                <span className={styles.icon_right}>{props.rightIcon}</span>
            </button>
        );
    }

    const socialsItems = (
        <>
            <NavbarDropdownItem leftIcon={<AiFillTwitterCircle size={20} />}>
                Twitter
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<FaDiscord size={20} />}>
                Discord
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<BsMedium size={20} />}>
                Medium
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<FaGithub size={20} />}>
                GitHub
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<HiDocumentDuplicate size={20} />}>
                Docs
            </NavbarDropdownItem>
        </>
    );

    function handleLogout() {
        clickLogout();
        closeMenu ? closeMenu() : null;
    }

    const logoutButton = (
        <div className={styles.button_container} onClick={handleLogout}>
            <button className={styles.authenticate_button}>Logout</button>
        </div>
    );

    const settingsItems = (
        <>
            <NavbarDropdownItem
                leftIcon={<MdLanguage size={20} />}
                rightIcon={<MdArrowForwardIos />}
                goToMenu='languages'
            >
                Language
            </NavbarDropdownItem>
            <NavbarDropdownItem
                leftIcon={<RiErrorWarningLine size={20} />}
                rightIcon={<MdArrowForwardIos />}
                goToMenu='warnings'
            >
                Warnings
            </NavbarDropdownItem>
            <NavbarDropdownItem
                onClick={() => {
                    navigate('/tos');
                    closeMenu && closeMenu();
                }}
                leftIcon={<HiOutlineDocumentText size={20} />}
            >
                Terms of Service
            </NavbarDropdownItem>
            {isUserLoggedIn && logoutButton}
        </>
    );

    const handleWalkthroughClick = () => {
        setIsTutorialMode(!isTutorialMode);
        setIsNavbarMenuOpen(false);
    };
    const supportItems = (
        <>
            <NavbarDropdownItem leftIcon={<MdHelp size={20} />}>
                Help Center
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<MdReportProblem size={20} />}>
                Report a Problem
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<GoRequestChanges size={20} />}>
                Request Features
            </NavbarDropdownItem>
            <NavbarDropdownItem leftIcon={<BiMessageCheck size={20} />}>
                <div onClick={handleWalkthroughClick}>Show Walkthrough</div>
            </NavbarDropdownItem>
        </>
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lngs: any = {
        en: { nativeName: 'English' },
        zh: { nativeName: '中文' },
        kr: { nativeName: '한국어' },
    };
    const circleIcon = <FaDotCircle color='#CDC1FF' size={10} />;

    const languagesItems = (
        <>
            {Object.keys(lngs).map((lng, idx) => (
                <div key={idx} onClick={() => i18n.changeLanguage(lng)}>
                    <NavbarDropdownItem
                        goBackItem
                        key={idx}
                        rightIcon={
                            i18n.resolvedLanguage === lng ? circleIcon : null
                        }
                    >
                        {lngs[lng].nativeName}
                    </NavbarDropdownItem>
                </div>
            ))}
        </>
    );
    const warningItems = (
        <>
            <p>Warning Items</p>
        </>
    );

    const NavbardropdownItemData = [
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
    ];

    const ariaLabel =
        'You are currently on a focus mode on the main dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    // const mainAriaLabel = 'account dropdown menu container';

    return (
        <FocusTrap
            focusTrapOptions={{
                clickOutsideDeactivates: true,
            }}
        >
            <div
                className={styles.dropdown}
                ref={dropdownRef}
                // tabIndex={0}
                aria-label={ariaLabel}
            >
                <CSSTransition
                    in={activeMenu === 'main'}
                    unmountOnExit
                    timeout={300}
                    classNames='menu-primary'
                >
                    {/* Menu with each drop down item */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className={styles.menu}
                        tabIndex={0}
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
                        <NavbarDropdownItem leftIcon={<BsBook size={18} />}>
                            Docs
                        </NavbarDropdownItem>
                    </motion.div>
                </CSSTransition>

                {NavbardropdownItemData.map((item) => (
                    <CSSTransition
                        in={activeMenu === item.title}
                        unmountOnExit
                        key={item.title}
                        timeout={300}
                        classNames='menu-secondary'
                        appear={true}
                    >
                        <div className={styles.menu}>
                            <NavbarDropdownItem
                                goToMenu='main'
                                leftIcon={<BiArrowBack />}
                                goBackItem
                            >
                                <h3>{item.title}</h3>
                            </NavbarDropdownItem>
                            {item.data}
                        </div>
                    </CSSTransition>
                ))}
                <CSSTransition
                    in={activeMenu === 'languages'}
                    unmountOnExit
                    timeout={300}
                    classNames='menu-tertiary'
                    appear={true}
                >
                    <div className={styles.menu}>
                        <NavbarDropdownItem
                            goToMenu='Settings & Privacy'
                            leftIcon={<BiArrowBack />}
                            goBackItem
                        >
                            <h3>{'Languages'}</h3>
                        </NavbarDropdownItem>
                        {languagesItems}
                    </div>
                </CSSTransition>
                {/* warnings */}
                <CSSTransition
                    in={activeMenu === 'warnings'}
                    unmountOnExit
                    timeout={300}
                    classNames='menu-tertiary'
                    appear={true}
                >
                    <div className={styles.menu}>
                        <NavbarDropdownItem
                            goToMenu='Settings & Privacy'
                            leftIcon={<BiArrowBack />}
                            goBackItem
                        >
                            <h3>{'Warnings'}</h3>
                        </NavbarDropdownItem>
                        {warningItems}
                    </div>
                </CSSTransition>
            </div>
        </FocusTrap>
    );
}

export default memo(NavbarDropdownMenu);

// START: Import React and Dongles
import { ReactNode, useState, useRef, useEffect, memo } from 'react';

import { motion } from 'framer-motion';
import { CSSTransition } from 'react-transition-group';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { BsBook, BsMedium } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
import FocusTrap from 'focus-trap-react';

import '../../../App.css';
import styles from './NavbarDropdownMenu.module.css';
import useKeyPress from '../../../hooks/useKeyPress';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { openInNewTab } from '../../../../utils/functions/openInNewTab';
import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../../../constants';

interface NavbarDropdownItemPropsIF {
    goToMenu?: string;
    leftIcon?: ReactNode | string;
    topLevel?: boolean;
    goBackItem?: boolean;
    imageIcon?: string;
    onClick?: () => void;
    children: ReactNode;
    rightIcon?: ReactNode;
    isLogoutButton?: boolean;
}

interface NavbarDropdownMenuPropsIF {
    isUserLoggedIn: boolean | undefined;
    clickLogout: () => void;
    closeMenu?: () => void;
    setIsNavbarMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavbarDropdownMenu(props: NavbarDropdownMenuPropsIF) {
    const { closeMenu, clickLogout, setIsNavbarMenuOpen } = props;

    const [activeMenu, setActiveMenu] = useState('main');
    const dropdownRef = useRef(null);

    const isEscapePressed = useKeyPress('Escape');

    const linkGenTOS: linkGenMethodsIF = useLinkGen('tos');

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

        const logoutStyles = `${styles.navbar_logout}`;
        const menuItemStyles = `${styles.menu_item} ${topLevelItemStyle} ${goBackItemStyle}`;

        const buttonStyle = props.isLogoutButton
            ? logoutStyles
            : menuItemStyles;

        return (
            <button
                className={buttonStyle}
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

    const ariaLabel =
        'You are currently on a focus mode on the main dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    const closeMenuBar = () => closeMenu && closeMenu();

    const handleDocsClick = () => {
        console.log(`handling docs click! ${DOCS_LINK}`);
        openInNewTab(DOCS_LINK);
        closeMenuBar();
    };

    const handleTwitterClick = () => {
        openInNewTab(TWITTER_LINK);
        closeMenuBar();
    };

    const handleDiscordClick = () => {
        openInNewTab(DISCORD_LINK);
        closeMenuBar();
    };

    const handleMediumClick = () => {
        openInNewTab(MEDIUM_LINK);
        closeMenuBar();
    };

    const handleLegalPrivacyClick = () => {
        linkGenTOS.navigate();
        closeMenu && closeMenu();
    };

    return (
        <FocusTrap
            focusTrapOptions={{
                clickOutsideDeactivates: true,
            }}
        >
            <div
                className={styles.dropdown}
                ref={dropdownRef}
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
                        <NavbarDropdownItem
                            topLevel
                            rightIcon={<BsBook size={18} />}
                            onClick={handleDocsClick}
                        >
                            Docs
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            topLevel
                            rightIcon={<AiFillTwitterCircle size={20} />}
                            onClick={handleTwitterClick}
                        >
                            Twitter
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            topLevel
                            rightIcon={<FaDiscord size={20} />}
                            onClick={handleDiscordClick}
                        >
                            Discord
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            topLevel
                            rightIcon={<BsMedium size={20} />}
                            onClick={handleMediumClick}
                        >
                            Medium
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            topLevel
                            rightIcon={<IoDocumentTextSharp size={20} />}
                            onClick={handleLegalPrivacyClick}
                        >
                            Legal & Privacy
                        </NavbarDropdownItem>
                        <div className={`${styles.navbar_logout_container}`}>
                            <NavbarDropdownItem
                                topLevel
                                isLogoutButton
                                onClick={clickLogout}
                            >
                                Logout
                            </NavbarDropdownItem>
                        </div>
                    </motion.div>
                </CSSTransition>
            </div>
        </FocusTrap>
    );
}

export default memo(NavbarDropdownMenu);

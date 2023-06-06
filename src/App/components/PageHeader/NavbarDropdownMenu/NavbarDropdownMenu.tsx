// START: Import React and Dongles
import { ReactNode, useRef, useEffect, memo } from 'react';

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
import { openInNewTab } from '../../../../utils/functions/openInNewTab';
import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../../../constants';
import { useTermsAgreed } from '../../../hooks/useTermsAgreed';

interface NavbarDropdownItemPropsIF {
    onClick: () => void;
    children: ReactNode;
    rightIcon?: ReactNode;
    isLogoutButton?: boolean;
}

interface NavbarDropdownMenuPropsIF {
    isUserLoggedIn: boolean | undefined;
    clickLogout: () => void;
    closeMenu?: () => void;
    setIsNavbarMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    openWagmiModal: () => void;
}

function NavbarDropdownMenu(props: NavbarDropdownMenuPropsIF) {
    const {
        closeMenu,
        clickLogout,
        setIsNavbarMenuOpen,
        openWagmiModal,
        isUserLoggedIn,
    } = props;

    const [, , termsUrls] = useTermsAgreed();

    const dropdownRef = useRef(null);

    const isEscapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (isEscapePressed) {
            setIsNavbarMenuOpen(false);
        }
    }, [isEscapePressed]);

    function NavbarDropdownItem(props: NavbarDropdownItemPropsIF) {
        const topLevelItemStyle = styles.topLevelContainer;

        const logoutStyles = `${styles.navbar_logout}`;
        const menuItemStyles = `${styles.menu_item} ${topLevelItemStyle}`;

        const buttonStyle = props.isLogoutButton
            ? logoutStyles
            : menuItemStyles;

        return (
            <button
                className={buttonStyle}
                onClick={() => props.onClick()}
                tabIndex={0}
                role='button'
            >
                <span>{props.children}</span>
                <span className={`${styles.icon_right}`}>
                    {props.rightIcon}
                </span>
            </button>
        );
    }

    const ariaLabel =
        'You are currently on a focus mode on the main dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    const closeMenuBar = () => closeMenu && closeMenu();

    const handleDocsClick = () => {
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
        openInNewTab(`${window.location.origin}/${termsUrls.privacy}`);
        closeMenuBar();
    };

    const handleTOSClick = () => {
        openInNewTab(`${window.location.origin}/${termsUrls.tos}`);
        closeMenuBar();
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
                    in={true}
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
                            rightIcon={<BsBook size={18} />}
                            onClick={handleDocsClick}
                        >
                            Docs
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            rightIcon={<AiFillTwitterCircle size={20} />}
                            onClick={handleTwitterClick}
                        >
                            Twitter
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            rightIcon={<FaDiscord size={20} />}
                            onClick={handleDiscordClick}
                        >
                            Discord
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            rightIcon={<BsMedium size={20} />}
                            onClick={handleMediumClick}
                        >
                            Medium
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            rightIcon={<IoDocumentTextSharp size={20} />}
                            onClick={handleLegalPrivacyClick}
                        >
                            Privacy
                        </NavbarDropdownItem>
                        <NavbarDropdownItem
                            rightIcon={<IoDocumentTextSharp size={20} />}
                            onClick={handleTOSClick}
                        >
                            Terms of Service
                        </NavbarDropdownItem>
                        {isUserLoggedIn ? (
                            <div
                                className={`${styles.navbar_logout_container}`}
                            >
                                <NavbarDropdownItem
                                    isLogoutButton
                                    onClick={() => {
                                        clickLogout();
                                        closeMenu ? closeMenu() : null;
                                    }}
                                >
                                    Logout
                                </NavbarDropdownItem>
                            </div>
                        ) : (
                            <div
                                className={`${styles.navbar_logout_container}`}
                            >
                                <NavbarDropdownItem
                                    isLogoutButton
                                    onClick={openWagmiModal}
                                >
                                    Connect Wallet
                                </NavbarDropdownItem>
                            </div>
                        )}
                    </motion.div>
                </CSSTransition>
            </div>
        </FocusTrap>
    );
}

export default memo(NavbarDropdownMenu);

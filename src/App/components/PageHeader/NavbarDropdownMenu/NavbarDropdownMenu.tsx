// START: Import React and Dongles
import { useRef, useEffect, memo, useContext } from 'react';
import { CSSTransition } from 'react-transition-group';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { BsMedium } from 'react-icons/bs';
import { SiGitbook } from 'react-icons/si';
import { RiSpyFill } from 'react-icons/ri';
import { FaDiscord, FaQuestion } from 'react-icons/fa';
import '../../../App.css';
import useKeyPress from '../../../hooks/useKeyPress';
import { openInNewTab } from '../../../../ambient-utils/dataLayer';
import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../../../ambient-utils/constants';
import { useTermsAgreed } from '../../../hooks/useTermsAgreed';
import { LogoutButton } from '../../../../components/Global/LogoutButton/LogoutButton';
import { AppStateContext } from '../../../../contexts/AppStateContext';

import { motion } from 'framer-motion';
import NavbarDropdownItem from './NavbarDropdownItem';
import styles from './NavbarDropdownMenu.module.css';

interface propsIF {
    isUserLoggedIn: boolean | undefined;
    clickLogout: () => void;
    closeMenu?: () => void;
    setIsNavbarMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavbarDropdownMenu(props: propsIF) {
    const { closeMenu, clickLogout, setIsNavbarMenuOpen, isUserLoggedIn } =
        props;

    const {
        walletModal: { open: openWalletModal },
        appHeaderDropdown,
    } = useContext(AppStateContext);

    const [, , termsUrls] = useTermsAgreed();

    const dropdownRef = useRef(null);

    const isEscapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (isEscapePressed) {
            setIsNavbarMenuOpen(false);
        }
    }, [isEscapePressed]);

    const ariaLabel =
        'You are currently on a focus mode on the main dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    interface navDataIF {
        icon: JSX.Element;
        resource: string;
        text: string;
    }

    const navData: navDataIF[] = [
        {
            icon: <SiGitbook size={20} />,
            resource: DOCS_LINK,
            text: 'Docs',
        },
        {
            icon: <AiFillTwitterCircle size={20} />,
            resource: TWITTER_LINK,
            text: 'Twitter',
        },
        {
            icon: <FaDiscord size={20} />,
            resource: DISCORD_LINK,
            text: 'Discord',
        },
        {
            icon: <BsMedium size={20} />,
            resource: MEDIUM_LINK,
            text: 'Medium',
        },
        {
            icon: <RiSpyFill size={20} />,
            resource: `${window.location.origin}/${termsUrls.privacy}`,
            text: 'Privacy',
        },
        {
            icon: <IoDocumentTextSharp size={20} />,
            resource: `${window.location.origin}/${termsUrls.tos}`,
            text: 'Terms of Service',
        },
        {
            icon: <FaQuestion size={20} />,
            resource: `${window.location.origin}/faq`,
            text: 'FAQ',
        },
    ];

    return (
        <>
            <div
                className={styles.background_blur}
                onClick={(event: React.MouseEvent) => {
                    event?.stopPropagation();
                    closeMenu && closeMenu()
                }}
            />
            <div
                className={styles.container}
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
                        className={styles.menu}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        tabIndex={0}
                    >
                        {navData.map((item: navDataIF) => (
                            <NavbarDropdownItem
                                key={item.text}
                                rightIcon={item.icon}
                                onClick={() => {
                                    openInNewTab(item.resource);
                                    closeMenu && closeMenu();
                                }}
                            >
                                {item.text}
                            </NavbarDropdownItem>
                        ))}
                        {isUserLoggedIn ? (
                            <div className={styles.navbarLogoutContainer}>
                                <LogoutButton
                                    onClick={() => {
                                        clickLogout();
                                        closeMenu && closeMenu();
                                        appHeaderDropdown.setIsActive(false);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={styles.navbarLogoutContainer}>
                                <NavbarDropdownItem
                                    connectButton
                                    onClick={() => {
                                        openWalletModal();
                                        appHeaderDropdown.setIsActive(false);
                                    }}
                                >
                                    Connect Wallet
                                </NavbarDropdownItem>
                            </div>
                        )}
                    </motion.div>
                </CSSTransition>
            </div>
        </>
    );
}

export default memo(NavbarDropdownMenu);

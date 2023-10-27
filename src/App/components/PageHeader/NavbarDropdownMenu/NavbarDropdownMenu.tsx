// START: Import React and Dongles
import { ReactNode, useRef, useEffect, memo, useContext } from 'react';

import { CSSTransition } from 'react-transition-group';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { BsBook, BsMedium } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
import { GiAlligatorClip } from 'react-icons/gi';

import '../../../App.css';
import useKeyPress from '../../../hooks/useKeyPress';
import { openInNewTab } from '../../../../utils/functions/openInNewTab';
import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
    CORPORATE_LINK,
} from '../../../../constants';
import { useTermsAgreed } from '../../../hooks/useTermsAgreed';
import { LogoutButton } from '../../../../components/Global/LogoutButton/LogoutButton';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import {
    ConnectButton,
    NavbarDropdown,
    IconRight,
    Menu,
    MenuItem,
    NavbarLogoutContainer,
} from '../../../../styled/Components/Header';

interface NavbarDropdownItemPropsIF {
    onClick: () => void;
    children: ReactNode;
    rightIcon?: ReactNode;
    connectButton?: boolean;
}

interface NavbarDropdownMenuPropsIF {
    isUserLoggedIn: boolean | undefined;
    clickLogout: () => void;
    closeMenu?: () => void;
    setIsNavbarMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavbarDropdownMenu(props: NavbarDropdownMenuPropsIF) {
    const { closeMenu, clickLogout, setIsNavbarMenuOpen, isUserLoggedIn } =
        props;

    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);

    const [, , termsUrls] = useTermsAgreed();

    const dropdownRef = useRef(null);

    const isEscapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (isEscapePressed) {
            setIsNavbarMenuOpen(false);
        }
    }, [isEscapePressed]);

    function NavbarDropdownItem(props: NavbarDropdownItemPropsIF) {
        const innerHtml = (
            <>
                <span>{props.children}</span>
                <IconRight>{props.rightIcon}</IconRight>
            </>
        );
        if (props.connectButton) {
            return (
                <ConnectButton
                    onClick={() => props.onClick()}
                    tabIndex={0}
                    role='button'
                >
                    {innerHtml}
                </ConnectButton>
            );
        }

        return (
            <MenuItem
                alignItems='center'
                rounded
                color='text1'
                fontSize='header2'
                onClick={() => props.onClick()}
                tabIndex={0}
                role='button'
                fullWidth
            >
                {innerHtml}
            </MenuItem>
        );
    }

    const ariaLabel =
        'You are currently on a focus mode on the main dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    const closeMenuBar = (): void => closeMenu && closeMenu();

    interface navDataIF {
        icon: JSX.Element;
        action: () => void;
        text: string;
    }

    const navData: navDataIF[] = [
        {
            icon: <BsBook size={18} />,
            action: () => {
                openInNewTab(DOCS_LINK);
                closeMenuBar();
            },
            text: 'Docs',
        },
        {
            icon: <AiFillTwitterCircle size={20} />,
            action: () => {
                openInNewTab(TWITTER_LINK);
                closeMenuBar();
            },
            text: 'Twitter',
        },
        {
            icon: <FaDiscord size={20} />,
            action: () => {
                openInNewTab(DISCORD_LINK);
                closeMenuBar();
            },
            text: 'Discord',
        },
        {
            icon: <BsMedium size={20} />,
            action: () => {
                openInNewTab(MEDIUM_LINK);
                closeMenuBar();
            },
            text: 'Medium',
        },
        {
            icon: <IoDocumentTextSharp size={20} />,
            action: () => {
                openInNewTab(`${window.location.origin}/${termsUrls.privacy}`);
                closeMenuBar();
            },
            text: 'Privacy',
        },
        {
            icon: <IoDocumentTextSharp size={20} />,
            action: () => {
                openInNewTab(`${window.location.origin}/${termsUrls.tos}`);
                closeMenuBar();
            },
            text: 'Terms of Service',
        },
        {
            icon: <GiAlligatorClip size={20} />,
            action: () => {
                window.open(CORPORATE_LINK, '_blank');
                closeMenuBar();
            },
            text: 'About the Team',
        },
    ];

    return (
        <NavbarDropdown ref={dropdownRef} aria-label={ariaLabel}>
            <CSSTransition
                in={true}
                unmountOnExit
                timeout={300}
                classNames='menu-primary'
            >
                {/* Menu with each drop down item */}
                <Menu
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    tabIndex={0}
                >
                    {navData.map((item: navDataIF) => (
                        <NavbarDropdownItem
                            key={item.text}
                            rightIcon={item.icon}
                            onClick={item.action}
                        >
                            {item.text}
                        </NavbarDropdownItem>
                    ))}
                    {isUserLoggedIn ? (
                        <NavbarLogoutContainer>
                            <LogoutButton
                                onClick={() => {
                                    clickLogout();
                                    closeMenu && closeMenu();
                                }}
                            />
                        </NavbarLogoutContainer>
                    ) : (
                        <NavbarLogoutContainer>
                            <NavbarDropdownItem
                                connectButton
                                onClick={openWagmiModal}
                            >
                                Connect Wallet
                            </NavbarDropdownItem>
                        </NavbarLogoutContainer>
                    )}
                </Menu>
            </CSSTransition>
        </NavbarDropdown>
    );
}

export default memo(NavbarDropdownMenu);

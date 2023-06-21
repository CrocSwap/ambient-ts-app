import React, { useContext, useState } from 'react';
import styles from './PageHeaderMobile.module.css';
import { FaWallet } from 'react-icons/fa';
import { AppStateContext } from '../../../contexts/AppStateContext';
import logo from '../../../assets/images/logos/ambient_logo.png';
import NavbarDropdownMenu from './NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from './NavItem/NavItem';
import { FiMenu } from 'react-icons/fi';
import trimString from '../../../utils/functions/trimString';
import { Link, useLocation } from 'react-router-dom';

interface PropsIF {
    clickLogout: () => Promise<void>;
    isUserLoggedIn: boolean;
    ensName: string;
    accountAddressFull: string;
}
const PageHeaderMobile = (props: PropsIF) => {
    const { clickLogout, isUserLoggedIn, ensName } = props;

    const location = useLocation();

    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const [openNavbarMenu, setOpenNavbarMenu] = useState(false);
    const connectedEnsOrAddressTruncated = ensName
        ? trimString(ensName, 10, 3, '…')
        : trimString(props.accountAddressFull, 5, 3, '…');

    const connectWagmiButton = (
        <button
            className={styles.authenticate_button}
            onClick={() => openWagmiModal()}
        >
            <FaWallet color='var(--text1)' />
            Connect to a wallet
        </button>
    );

    const isHomePage = location.pathname === '/';
    return (
        <div
            className={styles.main_container}
            style={{ position: isHomePage ? 'fixed' : 'static' }}
        >
            <Link to='/' aria-label='Home' className={styles.link}>
                <img src={logo} alt='logo' width='35px' />
            </Link>

            <div className={styles.right_side}>
                {isUserLoggedIn ? (
                    <p className={styles.username}>
                        {connectedEnsOrAddressTruncated || '...'}
                    </p>
                ) : (
                    connectWagmiButton
                )}

                <NavItem
                    icon={<FiMenu size={20} color='var(--text1)' />}
                    open={openNavbarMenu}
                    setOpen={setOpenNavbarMenu}
                    square
                >
                    <NavbarDropdownMenu
                        isUserLoggedIn={isUserLoggedIn}
                        clickLogout={clickLogout}
                        setIsNavbarMenuOpen={setOpenNavbarMenu}
                        openWagmiModal={openWagmiModal}
                    />
                </NavItem>
            </div>
        </div>
    );
};

export default PageHeaderMobile;

// START: Import React and Dongles
import { useState, Dispatch, SetStateAction } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import Local Files
import styles from './Account.module.css';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

interface AccountPropsIF {
    isUserLoggedIn: boolean;
    nativeBalance: string | undefined;
    accountAddress: string;
    accountAddressFull: string;
    clickLogout: () => void;
    openModal: () => void;
    ensName: string;
    chainId: string;
    isAppOverlayActive: boolean;

    setIsAppOverlayActive: Dispatch<SetStateAction<boolean>>;
}

export default function Account(props: AccountPropsIF) {
    const {
        isUserLoggedIn,
        nativeBalance,
        clickLogout,
        ensName,
        openModal,
        chainId,
        isAppOverlayActive,
        setIsAppOverlayActive,
    } = props;

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [value, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(props.accountAddressFull);
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
        </SnackbarComponent>
    );

    const [openNavbarMenu, setOpenNavbarMenu] = useState(false);
    return (
        <div className={styles.account_container}>
            <IconWithTooltip title='Wallet balance' placement='bottom'>
                <span className={styles.white}>
                    {isUserLoggedIn
                        ? nativeBalance
                            ? 'Ξ ' + parseFloat(nativeBalance).toPrecision(4)
                            : '...'
                        : ''}
                </span>
            </IconWithTooltip>
            {isUserLoggedIn && (
                <NavLink to={`/${props.accountAddressFull}`}>
                    <div className={`${styles.title_gradient}`} onClick={handleCopyAddress}>
                        <MdAccountBalanceWallet color='#ebebff' />
                        <p>{ensName !== '' ? ensName : props.accountAddress}</p>
                    </div>
                </NavLink>
            )}
            <NavItem
                icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}
                open={openNavbarMenu}
                setOpen={setOpenNavbarMenu}
            >
                <DropdownMenu
                    isUserLoggedIn={isUserLoggedIn}
                    // isAuthenticated={isAuthenticated}
                    // isWeb3Enabled={isWeb3Enabled}
                    clickLogout={clickLogout}
                    openModal={openModal}
                    chainId={chainId}
                    isAppOverlayActive={isAppOverlayActive}
                    setIsAppOverlayActive={setIsAppOverlayActive}
                    setIsNavbarMenuOpen={setOpenNavbarMenu}
                />
            </NavItem>
            {snackbarContent}
        </div>
    );
}

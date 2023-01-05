// START: Import React and Dongles
import { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiCopy, FiExternalLink } from 'react-icons/fi';

// START: Import Local Files
import styles from './Account.module.css';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
// import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
import { MdAccountBalanceWallet } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import { AiOutlineLogout } from 'react-icons/ai';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAccount } from 'wagmi';

interface AccountPropsIF {
    isUserLoggedIn: boolean | undefined;
    nativeBalance: string | undefined;
    accountAddress: string;
    accountAddressFull: string;
    clickLogout: () => void;
    // openModal: () => void;
    ensName: string;
    chainId: string;
    isAppOverlayActive: boolean;

    setIsAppOverlayActive: Dispatch<SetStateAction<boolean>>;

    switchTheme: () => void;
    theme: string;
}

export default function Account(props: AccountPropsIF) {
    const {
        nativeBalance,
        clickLogout,
        ensName,
        // openModal,
        chainId,
        isAppOverlayActive,
        setIsAppOverlayActive,
        switchTheme,
        theme,
    } = props;

    const { connector, isConnected } = useAccount();

    const isUserLoggedIn = isConnected;

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
    const [showWalletDropdown, setShowWalletDropdown] = useState(false);

    useEffect(() => {
        !isUserLoggedIn ? setShowWalletDropdown(false) : null;
    }, [isUserLoggedIn]);

    const walletWrapperStyle = showWalletDropdown
        ? styles.wallet_wrapper_active
        : styles.wallet_wrapper;
    const walletDropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowWalletDropdown(false);
    };
    UseOnClickOutside(walletDropdownItemRef, clickOutsideHandler);

    const walletDisplay = (
        <section className={styles.wallet_display} ref={walletDropdownItemRef}>
            <div
                className={`${styles.title_gradient} `}
                // onClick={handleCopyAddress}
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
            >
                <MdAccountBalanceWallet color='var(--text-grey-white)' />
                <p>{ensName !== '' ? ensName : props.accountAddress}</p>
            </div>

            <div className={walletWrapperStyle}>
                <div className={styles.name_display_container}>
                    <div className={styles.name_display}>
                        <h2>{ensName !== '' ? ensName : props.accountAddress}</h2>
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href={`https://goerli.etherscan.io/address/${props.accountAddressFull}`}
                        >
                            <FiExternalLink />
                        </a>
                        <div onClick={handleCopyAddress}>
                            <FiCopy />
                        </div>
                    </div>
                    <div className={styles.wallet_display}>
                        <p>{connector?.name}</p>
                        <p>{props.accountAddress}</p>
                    </div>
                </div>

                <div className={styles.ambient_card_container}>
                    <div className={styles.ambient_card_content}>
                        <div className={styles.token_qty_display}>
                            <div className={styles.token_display}>
                                <img
                                    src='https://cdn.cdnlogo.com/logos/e/81/ethereum-eth.svg'
                                    alt=''
                                />
                                <h2>ETH</h2>
                            </div>

                            <div className={styles.value_display}>
                                <h2>
                                    {isUserLoggedIn
                                        ? nativeBalance
                                            ? 'Ξ ' + parseFloat(nativeBalance).toPrecision(4)
                                            : '...'
                                        : ''}
                                </h2>
                                <p>$63,853.924</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.actions_container}>
                    <button onClick={clickLogout}>
                        {' '}
                        <AiOutlineLogout color='var(--negative)' /> Disconnect
                    </button>
                    <NavLink to={'/account'}>
                        <CgProfile />
                        My Profile
                    </NavLink>
                </div>
            </div>
        </section>
    );
    return (
        <div className={styles.account_container}>
            {isUserLoggedIn && walletDisplay}
            <NavItem
                icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}
                open={openNavbarMenu}
                setOpen={setOpenNavbarMenu}
            >
                <DropdownMenu
                    isUserLoggedIn={isUserLoggedIn}
                    clickLogout={clickLogout}
                    // openModal={openModal}
                    chainId={chainId}
                    isAppOverlayActive={isAppOverlayActive}
                    setIsAppOverlayActive={setIsAppOverlayActive}
                    setIsNavbarMenuOpen={setOpenNavbarMenu}
                    switchTheme={switchTheme}
                    theme={theme}
                />
            </NavItem>
            {snackbarContent}
        </div>
    );
}

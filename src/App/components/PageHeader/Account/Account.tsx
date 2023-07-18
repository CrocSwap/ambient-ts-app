import { useState, useRef, useEffect, useContext } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './Account.module.css';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
import { MdAccountBalanceWallet } from 'react-icons/md';

import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAccount } from 'wagmi';
import WalletDropdown from './WalletDropdown/WalletDropdown';
import useKeyPress from '../../../hooks/useKeyPress';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import trimString from '../../../../utils/functions/trimString';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ExchangeBalanceModal } from '../ExchangeBalanceModal/ExchangeBalanceModal';
import { getFormattedNumber } from '../../../functions/getFormattedNumber';

interface propsIF {
    nativeBalance: string | undefined;
    accountAddress: string;
    accountAddressFull: string;
    clickLogout: () => void;
    ensName: string;
    walletDropdownTokenData:
        | {
              logo: string;
              symbol: string;
              value: string | undefined;
              amount: string | undefined;
          }[]
        | null;
    openWagmiModal: () => void;
}

export default function Account(props: propsIF) {
    const {
        nativeBalance,
        clickLogout,
        ensName,
        walletDropdownTokenData,
        openWagmiModal,
    } = props;

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { ethMainnetUsdPrice } = useContext(CrocEnvContext);
    const { connector, isConnected } = useAccount();

    const isUserLoggedIn = isConnected;

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(props.accountAddressFull);
        openSnackbar(`${props.accountAddressFull} copied`, 'info');
    }

    const connectedEnsOrAddressTruncated = ensName
        ? trimString(ensName, 10, 3, '…')
        : trimString(props.accountAddressFull, 5, 3, '…');

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

    const ethMainnetUsdValue =
        ethMainnetUsdPrice !== undefined && nativeBalance !== undefined
            ? ethMainnetUsdPrice * parseFloat(nativeBalance.replaceAll(',', ''))
            : undefined;

    const ethMainnetUsdValueTruncated = getFormattedNumber({
        value: ethMainnetUsdValue,
        isUSD: true,
        prefix: '',
    });

    const ethQuantityInWalletAndDeposits =
        nativeBalance === undefined
            ? undefined
            : parseFloat(nativeBalance) === 0
            ? '0.00'
            : nativeBalance;

    const ariaLabel =
        'You are currently on a focus mode on the account dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    const mainAriaLabel = 'account dropdown menu container';

    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            setShowWalletDropdown(false);
        }
    }, [isEscapePressed]);
    const walletDisplay = (
        <section
            className={styles.wallet_display}
            ref={walletDropdownItemRef}
            aria-label={mainAriaLabel}
        >
            <button
                tabIndex={0}
                className={`${styles.title_gradient} `}
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                aria-label={ariaLabel}
            >
                <MdAccountBalanceWallet color='var(--text1)' />
                <p className={styles.wallet_name}>
                    {connectedEnsOrAddressTruncated || '...'}
                </p>
            </button>
            {showWalletDropdown ? (
                <WalletDropdown
                    ensName={ensName !== '' ? ensName : ''}
                    accountAddress={props.accountAddress}
                    handleCopyAddress={handleCopyAddress}
                    connectorName={connector?.name}
                    clickLogout={clickLogout}
                    walletWrapperStyle={walletWrapperStyle}
                    ethAmount={
                        isUserLoggedIn
                            ? nativeBalance
                                ? 'Ξ ' + ethQuantityInWalletAndDeposits
                                : '...'
                            : ''
                    }
                    ethValue={
                        ethMainnetUsdValueTruncated !== undefined
                            ? `${ethMainnetUsdValueTruncated}`
                            : undefined
                    }
                    accountAddressFull={props.accountAddressFull}
                    walletDropdownTokenData={walletDropdownTokenData}
                    clickOutsideHandler={clickOutsideHandler}
                />
            ) : null}
        </section>
    );

    return (
        <div className={styles.account_container}>
            {isUserLoggedIn && walletDisplay}
            {isConnected && <ExchangeBalanceModal />}
            <NavItem
                icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}
                open={openNavbarMenu}
                setOpen={setOpenNavbarMenu}
            >
                <DropdownMenu
                    isUserLoggedIn={isUserLoggedIn}
                    clickLogout={clickLogout}
                    setIsNavbarMenuOpen={setOpenNavbarMenu}
                    openWagmiModal={openWagmiModal}
                />
            </NavItem>
        </div>
    );
}

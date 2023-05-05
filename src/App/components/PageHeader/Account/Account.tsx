import { useState, useRef, useEffect, useContext } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './Account.module.css';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
import { MdAccountBalanceWallet } from 'react-icons/md';

import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAccount } from 'wagmi';
import { DefaultTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import { ChainSpec } from '@crocswap-libs/sdk';
import WalletDropdown from './WalletDropdown/WalletDropdown';
import useKeyPress from '../../../hooks/useKeyPress';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { AppStateContext } from '../../../../contexts/AppStateContext';

interface AccountPropsIF {
    isUserLoggedIn: boolean | undefined;
    nativeBalance: string | undefined;
    accountAddress: string;
    accountAddressFull: string;
    clickLogout: () => void;
    ensName: string;
    chainId: string;
    ethMainnetUsdPrice?: number;
    chainData: ChainSpec;
    lastBlockNumber: number;
}

export default function Account(props: AccountPropsIF) {
    const {
        nativeBalance,
        ethMainnetUsdPrice,
        clickLogout,
        ensName,
        chainId,
        lastBlockNumber,
        chainData,
    } = props;

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { connector, isConnected } = useAccount();

    const ensOrAddressTruncated = useAppSelector(
        (state) => state.userData.ensOrAddressTruncated,
    );

    const isUserLoggedIn = isConnected;

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(props.accountAddressFull);
        openSnackbar(`${props.accountAddressFull} copied`, 'info');
    }

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

    const ethMainnetUsdValueTruncated =
        ethMainnetUsdValue === undefined
            ? '…'
            : ethMainnetUsdValue === 0
            ? '$0.00'
            : ethMainnetUsdValue < 0.0001
            ? '$' + ethMainnetUsdValue.toExponential(2)
            : ethMainnetUsdValue < 2
            ? '$' + ethMainnetUsdValue.toPrecision(3)
            : '$' +
              ethMainnetUsdValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
            // tabIndex={0}
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
                    {ensOrAddressTruncated || '...'}
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
                    chainId={chainId}
                    ethAmount={
                        isUserLoggedIn
                            ? nativeBalance
                                ? 'Ξ ' + ethQuantityInWalletAndDeposits
                                : '...'
                            : ''
                    }
                    ethValue={`${ethMainnetUsdValueTruncated}`}
                    accountAddressFull={props.accountAddressFull}
                    showWalletDropdown={showWalletDropdown}
                    setShowWalletDropdown={setShowWalletDropdown}
                />
            ) : null}
        </section>
    );

    const blockNumberDisplay = (
        <DefaultTooltip
            interactive
            title={`Latest block number on ${chainData.displayName}`}
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div className={styles.block_number_div}>
                <div className={styles.page_block_sign} />
                <span>{lastBlockNumber ? lastBlockNumber : '…'}</span>
            </div>
        </DefaultTooltip>
    );
    return (
        <div className={styles.account_container}>
            {isUserLoggedIn && walletDisplay}
            {isUserLoggedIn && blockNumberDisplay}
            <NavItem
                icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}
                open={openNavbarMenu}
                setOpen={setOpenNavbarMenu}
            >
                <DropdownMenu
                    isUserLoggedIn={isUserLoggedIn}
                    clickLogout={clickLogout}
                    chainId={chainId}
                    setIsNavbarMenuOpen={setOpenNavbarMenu}
                />
            </NavItem>
        </div>
    );
}

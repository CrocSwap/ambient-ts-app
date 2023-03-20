// START: Import React and Dongles
import { useState, Dispatch, SetStateAction, useRef, useEffect } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import Local Files
import styles from './Account.module.css';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
// import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
import { MdAccountBalanceWallet } from 'react-icons/md';

import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { useAccount } from 'wagmi';
import { DefaultTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import { ChainSpec } from '@crocswap-libs/sdk';
import WalletDropdown from './WalletDropdown/WalletDropdown';
// import { formatAmountOld } from '../../../../utils/numbers';

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
    ethMainnetUsdPrice?: number;

    setIsAppOverlayActive: Dispatch<SetStateAction<boolean>>;
    isTutorialMode: boolean;
    setIsTutorialMode: Dispatch<SetStateAction<boolean>>;

    switchTheme: () => void;
    theme: string;
    chainData: ChainSpec;
    lastBlockNumber: number;
}

export default function Account(props: AccountPropsIF) {
    const {
        nativeBalance,
        ethMainnetUsdPrice,
        clickLogout,
        ensName,
        // openModal,
        chainId,
        isAppOverlayActive,
        setIsAppOverlayActive,
        switchTheme,
        theme,
        lastBlockNumber,
        chainData,
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

    const ethMainnetUsdValue =
        ethMainnetUsdPrice !== undefined && nativeBalance !== undefined
            ? ethMainnetUsdPrice * parseFloat(nativeBalance)
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
            : parseFloat(nativeBalance).toPrecision(4);

    const walletDisplay = (
        <section className={styles.wallet_display} ref={walletDropdownItemRef}>
            <div
                className={`${styles.title_gradient} `}
                // onClick={handleCopyAddress}
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
            >
                <MdAccountBalanceWallet color='var(--text-grey-white)' />
                <p className={styles.wallet_name}>
                    {ensName !== '' ? ensName : props.accountAddress}
                </p>
            </div>

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
                ethValue={`${ethMainnetUsdValueTruncated}`}
                accountAddressFull={props.accountAddressFull}
            />
        </section>
    );

    const blockNumberDisplay = (
        <DefaultTooltip
            interactive
            title={`Latest block number on ${chainData.displayName}`}
            // placement={'bottom'}
            placement={'bottom'}
            arrow
            enterDelay={100}
            leaveDelay={200}
        >
            <div className={styles.block_number_div}>
                <div className={styles.page_block_sign} />
                <span>{lastBlockNumber}</span>
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
                    // openModal={openModal}
                    chainId={chainId}
                    isAppOverlayActive={isAppOverlayActive}
                    setIsAppOverlayActive={setIsAppOverlayActive}
                    setIsNavbarMenuOpen={setOpenNavbarMenu}
                    switchTheme={switchTheme}
                    theme={theme}
                    isTutorialMode={props.isTutorialMode}
                    setIsTutorialMode={props.setIsTutorialMode}
                />
            </NavItem>
            {snackbarContent}
        </div>
    );
}

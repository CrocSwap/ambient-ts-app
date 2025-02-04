import { useContext, useEffect, useRef, useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { MdAccountBalanceWallet } from 'react-icons/md';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';

import {
    getFormattedNumber,
    trimString,
} from '../../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import useKeyPress from '../../../hooks/useKeyPress';
import { ExchangeBalanceDropdown } from '../ExchangeBalanceDropdown/ExchangeBalanceDropdown';
import WalletDropdown from './WalletDropdown/WalletDropdown';

import Modal from '../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../components/Global/ModalHeader/ModalHeader';
import NotificationCenter from '../../../../components/Global/NotificationCenter/NotificationCenter';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import LevelDropdown from './LevelDropdown/LevelDropdown';
import styles from './UserMenu.module.css';
// TODO: use user context instead of UseAccount
interface propsIF {
    accountAddress: string;
    accountAddressFull: string;
    clickLogout: () => void;
    ensName: string;
}

export default function UserMenu(props: propsIF) {
    const { clickLogout, ensName } = props;

    const {
        snackbar: { open: openSnackbar },
        appHeaderDropdown,
    } = useContext(AppStateContext);

    const { isUserConnected } = useContext(UserDataContext);

    const { connectedUserXp } = useContext(ChainDataContext);
    const desktopScreen = useMediaQuery('(min-width: 768px)');

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
    const [showLevelDropdown, setShowLevelDropdown] = useState(false);

    useEffect(() => {
        if (!isUserConnected) {
            setShowWalletDropdown(false);
            setShowLevelDropdown(false);
        }
    }, [isUserConnected]);

    const walletDropdownItemRef = useRef<HTMLDivElement>(null);
    const levelDropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideWalletHandler = () => {
        if (!desktopScreen) return null;
        setShowWalletDropdown(false);
    };
    const clickOutsideLevelHandler = () => {
        if (!desktopScreen) return null;

        setShowLevelDropdown(false);
    };
    UseOnClickOutside(walletDropdownItemRef, clickOutsideWalletHandler);
    UseOnClickOutside(levelDropdownItemRef, clickOutsideLevelHandler);

    const ariaLabel =
        'You are currently on a focus mode on the account dropdown menu. To enter focus mode, press tab once again.  To exit focus mode, press escape.';

    const mainAriaLabel = 'account dropdown menu container';

    const isEscapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (isEscapePressed) {
            setShowWalletDropdown(false);
            setShowLevelDropdown(false);
            appHeaderDropdown.setIsActive(false);
        }
    }, [isEscapePressed]);

    function closeWalletModal() {
        setShowWalletDropdown(false);
    }

    const walletDisplayModal = (
        <Modal usingCustomHeader onClose={closeWalletModal}>
            <ModalHeader title={'My Wallet'} onClose={closeWalletModal} />
            <WalletDropdown
                ensName={ensName !== '' ? ensName : ''}
                accountAddress={props.accountAddress}
                handleCopyAddress={handleCopyAddress}
                clickLogout={clickLogout}
                accountAddressFull={props.accountAddressFull}
                clickOutsideHandler={clickOutsideWalletHandler}
            />
        </Modal>
    );

    const walletDisplay = (
        <section
            style={{
                position: 'relative',
                fontSize: '16px',
                marginTop: '1px',
            }}
            ref={walletDropdownItemRef}
            aria-label={mainAriaLabel}
        >
            <button
                className={styles.titleGradientButton}
                tabIndex={0}
                onClick={() => {
                    setShowWalletDropdown(!showWalletDropdown);
                }}
                aria-label={ariaLabel}
            >
                <MdAccountBalanceWallet color='var(--text1)' />
                <p className={styles.walletName}>
                    {connectedEnsOrAddressTruncated || '...'}
                </p>
            </button>
            {showWalletDropdown ? (
                !desktopScreen ? (
                    walletDisplayModal
                ) : (
                    <WalletDropdown
                        ensName={ensName !== '' ? ensName : ''}
                        accountAddress={props.accountAddress}
                        handleCopyAddress={handleCopyAddress}
                        clickLogout={clickLogout}
                        accountAddressFull={props.accountAddressFull}
                        clickOutsideHandler={clickOutsideWalletHandler}
                    />
                )
            ) : null}
        </section>
    );
    const currentLevel = connectedUserXp?.data?.currentLevel;

    const formattedXpLevel = getFormattedNumber({
        value: currentLevel,
        abbrevThreshold: 1000,
        minFracDigits: 0,
        maxFracDigits: 0,
        isLevel: true,
        mantissa:
            (currentLevel || 1) >= 100000 && (currentLevel || 1) < 1000000
                ? 0
                : 1,
    });

    const currentLevelDisplay =
        currentLevel !== undefined && currentLevel?.toString()?.length >= 2
            ? formattedXpLevel
            : currentLevel;

    function handleCloseLevel() {
        setShowLevelDropdown(false);
    }
    const levelDisplayModal = (
        <Modal usingCustomHeader onClose={handleCloseLevel}>
            <ModalHeader title={'My Level'} onClose={handleCloseLevel} />
            <LevelDropdown
                ensName={ensName !== '' ? ensName : ''}
                accountAddress={props.accountAddress}
                handleCopyAddress={handleCopyAddress}
                accountAddressFull={props.accountAddressFull}
                connectedUserXp={connectedUserXp}
            />
        </Modal>
    );

    const levelDisplay = (
        <section
            style={{
                position: 'relative',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
            }}
            ref={levelDropdownItemRef}
            aria-label={mainAriaLabel}
        >
            <button
                className={`${styles.levelButton} ${formattedXpLevel.length >= 4 ? styles.largeLevelButton : ''}`}
                tabIndex={0}
                onClick={() => {
                    setShowLevelDropdown(!showLevelDropdown);
                }}
                aria-label={ariaLabel}
            >
                {currentLevelDisplay}
            </button>
            {showLevelDropdown ? (
                !desktopScreen ? (
                    levelDisplayModal
                ) : (
                    <LevelDropdown
                        ensName={ensName !== '' ? ensName : ''}
                        accountAddress={props.accountAddress}
                        handleCopyAddress={handleCopyAddress}
                        accountAddressFull={props.accountAddressFull}
                        connectedUserXp={connectedUserXp}
                    />
                )
            ) : null}
        </section>
    );

    return (
        <FlexContainer
            justifyContent='flex-end'
            rounded
            gap={8}
            overflow='visible'
            alignItems='center'
        >
            {isUserConnected && walletDisplay}
            {isUserConnected && desktopScreen && levelDisplay}
            {isUserConnected && desktopScreen && <ExchangeBalanceDropdown />}
            <NotificationCenter />

            <NavItem
                icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}
                open={openNavbarMenu}
                setOpen={setOpenNavbarMenu}
            >
                <DropdownMenu
                    isUserLoggedIn={isUserConnected}
                    clickLogout={clickLogout}
                    setIsNavbarMenuOpen={setOpenNavbarMenu}
                />
            </NavItem>
        </FlexContainer>
    );
}

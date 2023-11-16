import { useState, useRef, useEffect, useContext } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
import { MdAccountBalanceWallet } from 'react-icons/md';

import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import WalletDropdown from './WalletDropdown/WalletDropdown';
import useKeyPress from '../../../hooks/useKeyPress';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import trimString from '../../../../utils/functions/trimString';
import { ExchangeBalanceDropdown } from '../ExchangeBalanceDropdown/ExchangeBalanceDropdown';
import {
    TitleGradientButton,
    WalletName,
} from '../../../../styled/Components/Header';
import { FlexContainer } from '../../../../styled/Common';
import { UserDataContext } from '../../../../contexts/UserDataContext';
// TODO: use user context instead of UseAccount
interface propsIF {
    accountAddress: string;
    accountAddressFull: string;
    clickLogout: () => void;
    ensName: string;
}

export default function Account(props: propsIF) {
    const { clickLogout, ensName } = props;

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const { isUserConnected } = useContext(UserDataContext);

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
        !isUserConnected ? setShowWalletDropdown(false) : null;
    }, [isUserConnected]);

    const walletDropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowWalletDropdown(false);
    };
    UseOnClickOutside(walletDropdownItemRef, clickOutsideHandler);

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
            style={{ position: 'relative', fontSize: '16px' }}
            ref={walletDropdownItemRef}
            aria-label={mainAriaLabel}
        >
            <TitleGradientButton
                tabIndex={0}
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                aria-label={ariaLabel}
            >
                <MdAccountBalanceWallet color='var(--text1)' />
                <WalletName>
                    {connectedEnsOrAddressTruncated || '...'}
                </WalletName>
            </TitleGradientButton>
            {showWalletDropdown ? (
                <WalletDropdown
                    ensName={ensName !== '' ? ensName : ''}
                    accountAddress={props.accountAddress}
                    handleCopyAddress={handleCopyAddress}
                    clickLogout={clickLogout}
                    accountAddressFull={props.accountAddressFull}
                    clickOutsideHandler={clickOutsideHandler}
                />
            ) : null}
        </section>
    );

    return (
        <FlexContainer
            justifyContent='flex-end'
            rounded
            gap={8}
            overflow='visible'
        >
            {isUserConnected && walletDisplay}
            {isUserConnected && <ExchangeBalanceDropdown />}
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

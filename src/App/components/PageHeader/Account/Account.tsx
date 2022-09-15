// START: Import React and Dongles
import { useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import Local Files
import styles from './Account.module.css';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';

interface AccountPropsIF {
    nativeBalance: string;
    accountAddress: string;
    accountAddressFull: string;
    isAuthenticated?: boolean;
    isWeb3Enabled?: boolean;
    clickLogout: () => void;
    openModal: () => void;
    ensName: string;
    chainId: string;
}

export default function Account(props: AccountPropsIF) {
    const { isAuthenticated, isWeb3Enabled, clickLogout, ensName, openModal, chainId } = props;

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
    return (
        <div className={styles.account_container}>
            <IconWithTooltip title='Wallet balance' placement='bottom'>
                <span className={styles.white}>
                    {props.nativeBalance && isAuthenticated && isWeb3Enabled
                        ? 'Ξ ' + parseFloat(props.nativeBalance).toPrecision(4)
                        : ''}
                </span>
            </IconWithTooltip>
            <div className={`${styles.title_gradient}`} onClick={handleCopyAddress}>
                {ensName !== '' && isAuthenticated ? ensName : props.accountAddress}
            </div>
            <NavItem icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}>
                <DropdownMenu
                    isAuthenticated={isAuthenticated}
                    isWeb3Enabled={isWeb3Enabled}
                    clickLogout={clickLogout}
                    openModal={openModal}
                    chainId={chainId}
                />
            </NavItem>
            {snackbarContent}
        </div>
    );
}

import styles from './Account.module.css';
import React, { useState } from 'react';
// import Popover from '@material-ui/core/Popover';
// import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';
// import { RiInformationLine } from 'react-icons/ri';
// import { GoRequestChanges } from 'react-icons/go';
// import { FaDiscord } from 'react-icons/fa';
// import { MdLanguage } from 'react-icons/md';
// import { BsBook } from 'react-icons/bs';
// import { HiOutlineDocumentText } from 'react-icons/hi';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import DropdownMenu from '../NavbarDropdownMenu/NavbarDropdownMenu';
import NavItem from '../NavItem/NavItem';

interface IAccountProps {
    nativeBalance: string;
    accountAddress: string;
    accountAddressFull: string;
    isAuthenticated?: boolean;
    isWeb3Enabled?: boolean;
    clickLogout: () => void;
    openModal: () => void;
    ensName: string;
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
}

export default function Account(props: IAccountProps): React.ReactElement<IAccountProps> {
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    // const [anchorEl, setAnchorEl] = useState(null);
    const [value, copy] = useCopyToClipboard();

    const {
        isAuthenticated,
        isWeb3Enabled,
        clickLogout,
        ensName,
        openModal,
        chainId,
        setFallbackChainId,
    } = props;
    // eslint-disable-next-line
    // const handlePopoverClick = (event: React.ChangeEvent<any>) => {
    //     setAnchorEl(event.currentTarget);
    // };

    // const handlePopoverClose = () => {
    //     setAnchorEl(null);
    // };

    // const handleLogout = () => {
    //     clickLogout();
    //     handlePopoverClose();
    // };

    // const open = Boolean(anchorEl);
    // const popoverId = open ? 'simple-popover' : undefined;

    // useEffect(() => {
    //     value ? console.log(value) : null;
    // }, [value]);

    // const logoutButton = (
    //     <button className={styles.authenticate_button} onClick={handleLogout}>
    //         Logout
    //     </button>
    // );

    // const popperContent = (
    //     <div className={styles.popperContent}>
    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>About</span>
    //             <RiInformationLine />
    //         </div>
    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>Help Center</span>
    //             <AiOutlineQuestionCircle />
    //         </div>
    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>Request Features</span>
    //             <GoRequestChanges />
    //         </div>
    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>Discord</span>
    //             <FaDiscord />
    //         </div>
    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>Language</span>
    //             <MdLanguage />
    //         </div>

    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>Docs</span>
    //             <BsBook />
    //         </div>
    //         <div className={styles.more_row} onClick={handlePopoverClose}>
    //             <span>Legal & Privacy</span>
    //             <HiOutlineDocumentText />
    //         </div>
    //         {isAuthenticated && isWeb3Enabled && logoutButton}
    //     </div>
    // );

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
            <span className={styles.white}>
                {props.nativeBalance && isAuthenticated && isWeb3Enabled
                    ? 'Ξ' + parseFloat(props.nativeBalance).toFixed(4)
                    : // ? parseFloat(props.nativeBalance).toFixed(4) + ' ETH'
                      ''}
            </span>
            {/* TODO : REFACTOR THIS TO POPUP ALERT ON COPY - USE VALUE */}
            <div className={`${styles.title_gradient}`} onClick={handleCopyAddress}>
                {ensName !== '' && isAuthenticated ? ensName : props.accountAddress}
            </div>

            {/* <AiOutlineQuestionCircle size={20} color='#CDC1FF' /> */}

            {/* <div className={styles.more} aria-describedby={popoverId} onClick={handlePopoverClick}>
                <FiMoreHorizontal size={20} color='#CDC1FF' />
            </div> */}
            <NavItem icon={<FiMoreHorizontal size={20} color='#CDC1FF' />}>
                <DropdownMenu
                    isAuthenticated={isAuthenticated}
                    isWeb3Enabled={isWeb3Enabled}
                    clickLogout={clickLogout}
                    openModal={openModal}
                    chainId={chainId}
                    setFallbackChainId={setFallbackChainId}
                />
            </NavItem>

            {/* <Popover
                id={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {popperContent}
            </Popover> */}
            {snackbarContent}
        </div>
    );
}

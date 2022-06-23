import styles from './Account.module.css';
import React, { useState, useEffect } from 'react';
import Popover from '@material-ui/core/Popover';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';
import { RiInformationLine } from 'react-icons/ri';
import { GoRequestChanges } from 'react-icons/go';
import { FaDiscord } from 'react-icons/fa';
import { MdLanguage } from 'react-icons/md';
import { BsBook } from 'react-icons/bs';
import { HiOutlineDocumentText } from 'react-icons/hi';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';

interface IAccountProps {
    nativeBalance: string;
    accountAddress: string;
    accountAddressFull: string;
    isAuthenticated?: boolean;
    isWeb3Enabled?: boolean;
    clickLogout: () => void;
}

export default function Account(props: IAccountProps): React.ReactElement<IAccountProps> {
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [value, copy] = useCopyToClipboard();

    const { isAuthenticated, isWeb3Enabled, clickLogout } = props;
    // eslint-disable-next-line
    const handlePopoverClick = (event: React.ChangeEvent<any>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        clickLogout();
        handlePopoverClose();
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'simple-popover' : undefined;

    useEffect(() => {
        value ? console.log(value) : null;
    }, [value]);

    const logoutButton = (
        <button className={styles.authenticate_button} onClick={handleLogout}>
            Logout
        </button>
    );

    const popperContent = (
        <div className={styles.popperContent}>
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>About</span>
                <RiInformationLine />
            </div>
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>Help Center</span>
                <AiOutlineQuestionCircle />
            </div>
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>Request Features</span>
                <GoRequestChanges />
            </div>
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>Discord</span>
                <FaDiscord />
            </div>
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>Language</span>
                <MdLanguage />
            </div>
            {/* <div className={styles.more_row} onClick={switchTheme}>
                <span>{theme === "dark" ? "Light" : "Dark"} Theme</span>
            </div> */}
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>Docs</span>
                <BsBook />
            </div>
            <div className={styles.more_row} onClick={handlePopoverClose}>
                <span>Legal & Privacy</span>
                <HiOutlineDocumentText />
            </div>
            {isAuthenticated && isWeb3Enabled && logoutButton}
        </div>
    );

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
            {/* <div className={styles.ethereum_icon}>
                <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                    alt='ethereum'
                    width='25px'
                />
            </div> */}

            <span className={styles.white}>
                {props.nativeBalance && isAuthenticated && isWeb3Enabled
                    ? parseFloat(props.nativeBalance).toFixed(4) + ' ETH'
                    : ''}
            </span>
            {/* TODO : REFACTOR THIS TO POPUP ALERT ON COPY - USE VALUE */}
            <div className={styles.title_gradient} onClick={handleCopyAddress}>
                {props.accountAddress}
            </div>

            <AiOutlineQuestionCircle size={20} color='#CDC1FF' />

            <div className={styles.more} aria-describedby={popoverId} onClick={handlePopoverClick}>
                <FiMoreHorizontal size={20} color='#CDC1FF' />
            </div>

            <Popover
                id={popoverId}
                // popoverId={popoverId}
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
            </Popover>
            {snackbarContent}
        </div>
    );
}

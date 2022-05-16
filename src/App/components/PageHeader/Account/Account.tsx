import styles from './Account.module.css';
// import React, { useState, useEffect } from 'react';
// import Popover from '@material-ui/core/Popover';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';

interface IAccountProps {
    nativeBalance: string;
}

export default function Account(props: IAccountProps): React.ReactElement<IAccountProps> {
    // const [anchorEl, setAnchorEl] = useState(null);

    // const handlePopoverClick = (event: React.ChangeEvent<any>) => {
    //     setAnchorEl(event.currentTarget);
    // };

    // const handlePopoverClose = () => {
    //     setAnchorEl(null);
    // };

    // const open = Boolean(anchorEl);
    // const popoverId = open ? 'simple-popover' : undefined;

    // const popperContent = (
    //     <div className={styles.popperContent}>
    //         <div className={styles.more_row}>
    //             <span>About</span>
    //         </div>
    //         <div className={styles.more_row}>
    //             <span>Help Center</span>
    //         </div>
    //         <div className={styles.more_row}>
    //             <span>Request Features</span>
    //         </div>
    //         <div className={styles.more_row}>
    //             <span>Discord</span>
    //         </div>
    //         <div className={styles.more_row}>
    //             <span>Language</span>
    //         </div>
    //         <div className={styles.more_row} onClick={switchTheme}>
    //             <span>{theme === "dark" ? "Light" : "Dark"} Theme</span>
    //         </div>
    //         <div className={styles.more_row}>
    //             <span>Docs</span>
    //         </div>
    //         <div className={styles.more_row}>
    //             <span>Legal & Privacy</span>
    //         </div>
    //         <Button title="Logout"/>
    //     </div>
    // );
    return (
        <div className={styles.account_container}>
            <div className={styles.ethereum_icon}>
                <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                    alt='ethereum'
                    width='25px'
                />
            </div>

            <div className={styles.title_gradient}>69 AMBI</div>
            <span className={styles.white}>{props.nativeBalance} ETH</span>
            {/* <div className={styles.title_gradient}>{useLocalStorage("ambientHandle")}</div> */}
            <div className={styles.title_gradient}>username</div>
            <AiOutlineQuestionCircle size={20} color='#ffffff' />

            <div>username</div>

            {/* <div className={styles.more} aria-describedby={popoverId} onClick={handlePopoverClick}>
                <FiMoreHorizontal size={20} color='#ffffff' />
            </div> */}
            <div className={styles.more}>
                <FiMoreHorizontal size={20} color='#ffffff' />
            </div>
            {/* <Popover
                popoverId={popoverId}
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {popperContent}
            </Popover> */}
        </div>
    );
}

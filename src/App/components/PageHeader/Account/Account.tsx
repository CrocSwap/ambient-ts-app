import styles from './Account.module.css';
import { useState, useEffect } from 'react';
import Popover from '@material-ui/core/Popover';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';

export default function Account() {
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'simple-popover' : undefined;

    const popperContent = (
        <div className={styles.popperContent}>
            <div className={styles.more_row}>
                <span>About</span>
            </div>
            <div className={styles.more_row}>
                <span>Help Center</span>
            </div>
            <div className={styles.more_row}>
                <span>Request Features</span>
            </div>
            <div className={styles.more_row}>
                <span>Discord</span>
            </div>
            <div className={styles.more_row}>
                <span>Language</span>
            </div>
            {/* <div className={styles.more_row} onClick={switchTheme}>
                <span>{theme === "dark" ? "Light" : "Dark"} Theme</span>
            </div> */}
            <div className={styles.more_row}>
                <span>Docs</span>
            </div>
            <div className={styles.more_row}>
                <span>Legal & Privacy</span>
            </div>
            {/* <Button title="Logout"/> */}
        </div>
    );
    return <div>Account</div>;
}

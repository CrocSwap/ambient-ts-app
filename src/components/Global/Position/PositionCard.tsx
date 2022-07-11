// Unfinished file - Currently not in used.

import styles from './PositionCard.module.css';
import { useState } from 'react';
import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from '../../../utils/functions/styles';
import { FiMoreHorizontal } from 'react-icons/fi';
import RangeStatus from '../RangeStatus/RangeStatus';

export default function PositionCard() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
    ) => {
        console.log('handleClick', event.currentTarget);
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        console.log('handleClose');
        setAnchorEl(null);
    };
    const classes = useStyles();

    return (
        <div className={styles.container}>
            <div className={styles.position_row}>
                <p className={`${styles.hide_ipad} ${styles.account_style}`}>0xaBcD...1234</p>
                <p className={`${styles.hide_ipad} ${styles.account_style}`}>0xAbCd...9876</p>

                <div className={styles.hide_desktop}>
                    <p className={styles.account_style}>0xaBcD...1234</p>
                    <p className={styles.account_style}>0xAbCd...9876</p>
                </div>

                <p className={`${styles.hide_ipad} ${styles.min_max}`}>Min</p>
                <p className={`${styles.hide_ipad} ${styles.min_max}`}> Max </p>

                <div className={styles.hide_desktop}>
                    <p className={styles.min_max}>Min</p>
                    <p className={styles.min_max}>Max</p>
                </div>
                <p className={`${styles.hide_ipad} ${styles.qty}`}>T1 Qty</p>
                <p className={`${styles.hide_ipad} ${styles.qty}`}>T2 Qty</p>
                <div className={styles.hide_desktop}>
                    <p className={styles.qty}>T1 Qty</p>
                    <p className={styles.qty}>T2 Qty</p>
                </div>
                <p className={`${styles.hide_mobile} ${styles.apy}`}>APY</p>

                <RangeStatus isInRange isAmbient={false} justSymbol />
                <button className={`${styles.option_button} ${styles.hide_mobile}`}>
                    Reposition
                </button>
                <div
                    aria-controls='list settings'
                    aria-haspopup='true'
                    onClick={handleClick}
                    className={styles.menu}
                >
                    <FiMoreHorizontal size={30} />
                </div>
                <Menu
                    id='simple-menu'
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    className={classes.menu}
                >
                    <MenuItem onClick={handleClose} className={classes.menuItem}>
                        Harvest
                    </MenuItem>
                    <MenuItem onClick={handleClose} className={classes.menuItem}>
                        Edit
                    </MenuItem>
                    <MenuItem onClick={handleClose} className={classes.menuItem}>
                        Remove
                    </MenuItem>
                    <MenuItem onClick={handleClose} className={classes.menuItem}>
                        Details
                    </MenuItem>
                </Menu>
            </div>
        </div>
    );
}

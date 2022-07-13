import styles from './TransactionCard.module.css';
import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from '../../utils/functions/styles';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useState } from 'react';
export default function TransactionCard() {
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

    const menuButtons = (
        <div className={styles.menu_container}>
            <div
                aria-controls='list settings'
                aria-haspopup='true'
                onClick={handleClick}
                className={`${styles.menu} `}
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
                    Edit
                </MenuItem>

                <MenuItem className={classes.menuItem}>Copy</MenuItem>

                <MenuItem onClick={openDetailsModal} className={classes.menuItem}>
                    Details
                </MenuItem>
            </Menu>
        </div>
    );

    const buttonsDisplay = (
        <div className={styles.buttons_container}>
            <button className={styles.details_button}>Edit</button>
            <button className={styles.details_button}>Copy</button>
            <button className={styles.details_button}>Details</button>
        </div>
    );
    return <div className={styles.row}></div>;
}

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

                <MenuItem className={classes.menuItem}>Details</MenuItem>
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

    const positionRow = (
        <div className={`${styles.container} `}>
            <div className={`${styles.position_row}  ${styles.positions_container}`}>
                <p className={`${styles.large_device} ${styles.account_style} `}>0xaBcD...1234</p>
                <p className={`${styles.large_device} ${styles.account_style}`}>0xAbCd...9876</p>

                <div className={`${styles.column_display} ${styles.account_displays}`}>
                    <p className={`${styles.account_style} `}>0xaBcD...1234</p>
                    <p className={styles.account_style}> 0xAbCd...9876</p>
                </div>

                <p className={styles.price}>Min</p>

                <p className={styles.side}>Remove</p>
                <p className={styles.type}>Range</p>
                <div className={` ${styles.remove_range_wrapper}`}>
                    <p className={styles.side_col}>Remove</p>
                    <p className={styles.type_col}>Range</p>
                </div>

                <p className={`${styles.qty_large_screen} ${styles.qty}`}>
                    T1 Qty
                    <img
                        src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                        alt='ethreum'
                    />
                </p>
                <p className={`${styles.qty_large_screen} ${styles.qty}`}>
                    T2 Qty
                    <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='usdc' />
                </p>
                <div className={`${styles.qty_column_display} ${styles.qty_display}`}>
                    <div className={styles.qty}>
                        <p>T1 Qty</p>
                        <img
                            src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                            alt='ethereum'
                        />
                    </div>
                    <div className={styles.qty}>
                        <p>T2 Qty</p>
                        <img src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png' alt='usdc' />
                    </div>
                </div>

                {/* <OpenOrderStatus isFilled /> */}
            </div>
            {buttonsDisplay}
            {menuButtons}
        </div>
    );
    return <>{positionRow}</>;
}

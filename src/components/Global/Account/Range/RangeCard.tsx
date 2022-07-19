import RangeStatus from '../../RangeStatus/RangeStatus';
import styles from './RangeCard.module.css';
import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from '../../../../utils/functions/styles';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

import { FiMoreHorizontal } from 'react-icons/fi';
export default function RangeCard() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const location = useLocation();
    const currentLocation = location.pathname;
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

    const position = {
        ambient: false,
    };

    const posHash = 1234;

    const openHarvestModal = () => console.log('opened');
    const openRemoveModal = () => console.log('opened');
    const openDetailsModal = () => console.log('opened');
    const tokenLogos = (
        <div className={styles.token_logos}>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
            <img
                src='https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                alt=''
            />
        </div>
    );

    const minMax = (
        <div className={styles.min_max}>
            <p>Min</p>
            <p>Max</p>
        </div>
    );

    const lardeDesktopMinMaxDisplay = (
        <div className={styles.min_max_range}>
            <p>Min: 1234.22</p>
            <p>Max: 232.212</p>
        </div>
    );

    const tokenQty = (
        <div className={styles.token_qty}>
            <p> T1 Qty</p>
            <img src='https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png' alt='' />
        </div>
    );

    const tokenQtyColumn = (
        <div className={styles.token_qty_column}>
            <p>T1 Qty</p>
            <p>T2 Qty</p>
        </div>
    );
    const accountColumn = (
        <div className={styles.account_column}>
            <p>0xcD...134</p>
            <p>0xcD...134</p>
        </div>
    );

    const menuButtons = (
        <div className={styles.menu_buttons}>
            <button>Edit</button>
            <button>Remove</button>
            <button>Details</button>
            <button>Harvest</button>
            <button>Reposition</button>
        </div>
    );

    const loggedInUserButtons = (
        <>
            <div
                aria-controls='list settings'
                aria-haspopup='true'
                onClick={handleClick}
                className={`${styles.menu} ${styles.hide_mobile}`}
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
                {!position.ambient && (
                    <MenuItem onClick={openHarvestModal} className={classes.menuItem}>
                        Harvest
                    </MenuItem>
                )}

                <MenuItem onClick={handleClose} className={classes.menuItem}>
                    <Link
                        to={`/trade/edit/${posHash}`}
                        // state={positionData}
                        replace={currentLocation.startsWith('/trade/edit')}
                    >
                        Edit
                    </Link>
                </MenuItem>

                <MenuItem onClick={openRemoveModal} className={classes.menuItem}>
                    Remove
                </MenuItem>

                <MenuItem onClick={openDetailsModal} className={classes.menuItem}>
                    Details
                </MenuItem>
            </Menu>
        </>
    );

    const menuIcon = (
        <div className={styles.min_buttons}>
            <button>Reposition</button>
            <div className={styles.menu_icon}>...</div>
        </div>
    );

    const inRangeStatus = (
        <div className={styles.range_status}>
            <RangeStatus isInRange isAmbient={false} />
        </div>
    );

    const rangeIcon2 = (
        <div className={styles.range_icon_2}>
            {' '}
            <RangeStatus isInRange justSymbol isAmbient={false} />
        </div>
    );

    const rowData = (
        <div className={styles.row}>
            <div className={styles.pool_name}>ABC/XYZ</div>
            <div className={styles.account}>0xcD...134</div>
            <div className={styles.account}>0BcD...134</div>

            {accountColumn}
            {minMax}
            {lardeDesktopMinMaxDisplay}
            {tokenQty}
            {tokenQty}
            {tokenQtyColumn}
            <div className={styles.apy}>APY</div>
            {inRangeStatus}
            {rangeIcon2}
        </div>
    );

    return (
        <div className={styles.main_container}>
            {tokenLogos}
            {rowData}
            {menuButtons}
            {menuIcon}
        </div>
    );
}

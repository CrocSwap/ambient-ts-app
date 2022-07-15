import styles from './TransactionCard.module.css';
import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from '../../../utils/functions/styles';
import { FiMoreHorizontal } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { BsPersonSquare } from 'react-icons/bs';
import { ImArrowUp, ImArrowDown } from 'react-icons/im';
import { useState } from 'react';
import { ISwap } from '../../../utils/state/graphDataSlice';
import trimString from '../../../utils/functions/trimString';
import TooltipComponent from '../TooltipComponent/TooltipComponent';

interface TransactionProps {
    // portfolio?: boolean;
    // notOnTradeRoute?: boolean;
    swap: ISwap;
    // isShowAllEnabled: boolean;
    // tokenAAddress: string;
    // tokenBAddress: string;
    // isAuthenticated: boolean;
    // account?: string;
    // isDenomBase: boolean;
}
export default function TransactionCard(props: TransactionProps) {
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
    const truncatedSwapID = trimString(props.swap.id, 5, 5, '…');
    const bottomElements = (
        <div className={styles.bottom_elements}>
            <div className={styles.account_elements}>
                <p>
                    0xaBcD...1234{' '}
                    <TooltipComponent
                        title='Wallet'
                        placement='top'
                        icon={<FaWallet size={10} />}
                    />
                </p>
                <p>
                    {truncatedSwapID}{' '}
                    <TooltipComponent
                        title='ID'
                        placement='top'
                        icon={<BsPersonSquare size={10} />}
                    />
                </p>
            </div>

            <div className={styles.min_max_elements}>
                <p>
                    <TooltipComponent
                        title='Min Price'
                        placement='top'
                        icon={<ImArrowDown size={10} />}
                    />
                    2134.32
                </p>
                <p>
                    86743.57
                    <TooltipComponent
                        title='Max Price'
                        placement='top'
                        icon={<ImArrowUp size={10} />}
                    />
                </p>
            </div>
        </div>
    );

    return (
        <div className={`${styles.container} `}>
            <div className={styles.content_container}>
                <div className={`${styles.position_row}  ${styles.positions_container}`}>
                    <p className={`${styles.large_device} ${styles.account_style} `}>
                        {truncatedSwapID}
                    </p>
                    <p className={`${styles.large_device} ${styles.account_style}`}>
                        0xAbCd...9876
                    </p>

                    <p className={styles.price}>Min - Max</p>

                    <p className={styles.side}>Remove</p>
                    <p className={styles.type}>Range</p>

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
                </div>
                {buttonsDisplay}
                {menuButtons}
            </div>
            {bottomElements}
        </div>
    );
}

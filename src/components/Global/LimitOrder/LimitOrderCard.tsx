// Unfinished file - Currently not in used.
import { useModal } from '../Modal/useModal';
import Modal from '../Modal/Modal';
// import { Link, useLocation } from 'react-router-dom';

import styles from './LimitOrderCard.module.css';
import { useState } from 'react';
import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from '../../../utils/functions/styles';
import { FiMoreHorizontal } from 'react-icons/fi';
// import RangeStatus from '../RangeStatus/RangeStatus';
// import { Position2 } from '../../../utils/state/graphDataSlice';

// import RemoveRange from '../../RemoveRange/RemoveRange';
// import RangeDetails from '../../RangeDetails/RangeDetails';
import RangeDetailsHeader from '../../RangeDetails/RangeDetailsHeader/RangeDetailsHeader';
// import trimString from '../../../utils/functions/trimString';
// import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import OpenOrderStatus from '../OpenOrderStatus/OpenOrderStatus';

// interface LimitOrderCardProps {
//     portfolio?: boolean;
//     notOnTradeRoute?: boolean;
//     position: Position2;
//     isAllPositionsEnabled: boolean;
//     tokenAAddress: string;
//     tokenBAddress: string;
//     isAuthenticated: boolean;
//     account?: string;
//     isDenomBase: boolean;
//     userPosition?: boolean;
//     lastBlockNumber: number;
// }
export default function LimitOrderCard() {
    // const {
    //     position,

    //     tokenAAddress,
    //     tokenBAddress,

    //     userPosition,
    //     lastBlockNumber,
    // } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // const location = useLocation();

    // const currentLocation = location.pathname;
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

    const [isModalOpen, openModal, closeModal] = useModal();

    const [currentModal, setCurrentModal] = useState<string>('edit');

    const editContent = <div>I am edit</div>;

    // MODAL FUNCTIONALITY
    let modalContent: React.ReactNode;
    let modalTitle;

    function openDetailsModal() {
        setCurrentModal('details');
        openModal();
        handleClose();
    }
    //  END OF MODAL FUNCTIONALITY

    // const ownerId = position ? position.user : null;

    // const ensName = position?.userEnsName !== '' ? position.userEnsName : null;
    // const ownerIdTruncated = position ? trimString(position.user, 6, 6, '…') : null;
    // const mobileOwnerId = position ? trimString(position.user, 3, 3, '…') : null;

    // const positionData = {
    //     position: position,
    // };

    // let posHash;
    // if (position.ambient) {
    //     posHash = ambientPosSlot(position.user, position.base, position.quote);
    // } else {
    //     posHash = concPosSlot(
    //         position.user,
    //         position.base,
    //         position.quote,
    //         position.bidTick,
    //         position.askTick,
    //     );
    // }

    // let isPositionInRange = true;

    // if (position.poolPriceInTicks) {
    //     if (position.ambient) {
    //         isPositionInRange = true;
    //     } else if (
    //         position.bidTick <= position.poolPriceInTicks &&
    //         position.poolPriceInTicks <= position.askTick
    //     ) {
    //         isPositionInRange = true;
    //     } else {
    //         isPositionInRange = false;
    //     }
    // }

    // const positionBaseAddressLowerCase = position.base.toLowerCase();
    // const positionQuoteAddressLowerCase = position.quote.toLowerCase();

    // const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    // const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    // const positionMatchesSelectedTokens =
    //     (positionBaseAddressLowerCase === tokenAAddressLowerCase ||
    //         positionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
    //     (positionBaseAddressLowerCase === tokenBAddressLowerCase ||
    //         positionQuoteAddressLowerCase === tokenBAddressLowerCase);

    // const accountAddress = account ? account.toLowerCase() : null;

    // const displayAllOrOwned =
    //     isAllPositionsEnabled || (ownerId === accountAddress && isAuthenticated);
    // const notDisplayAllOrOwned =
    //     !isAllPositionsEnabled || (ownerId === accountAddress && isAuthenticated);

    // const removeRangeProps = {
    //     isPositionInRange: isPositionInRange,
    //     isAmbient: position.ambient,
    //     baseTokenSymbol: position.baseTokenSymbol,
    //     baseTokenDecimals: position.baseTokenDecimals,
    //     quoteTokenSymbol: position.quoteTokenSymbol,
    //     quoteTokenDecimals: position.quoteTokenDecimals,
    //     lowRangeDisplayInBase: position.lowRangeDisplayInBase,
    //     highRangeDisplayInBase: position.highRangeDisplayInBase,
    //     lowRangeDisplayInQuote: position.lowRangeDisplayInQuote,
    //     highRangeDisplayInQuote: position.highRangeDisplayInQuote,
    //     baseTokenLogoURI: position.baseTokenLogoURI,
    //     quoteTokenLogoURI: position.quoteTokenLogoURI,
    //     isDenomBase: props.isDenomBase,
    //     baseTokenAddress: props.position.base,
    //     quoteTokenAddress: props.position.quote,
    //     lastBlockNumber: lastBlockNumber,
    // };

    switch (currentModal) {
        case 'edit':
            modalContent = editContent;
            modalTitle = 'Edit Position';
            break;
        case 'details':
            modalContent = 'I am details for range';
            modalTitle = <RangeDetailsHeader />;
            break;
    }
    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

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

    const positionRow = (
        <div className={`${styles.container} `}>
            <div className={`${styles.position_row}  ${styles.positions_container}`}>
                <p className={`${styles.large_device} ${styles.account_style} `}>0xaBcD...1234</p>
                <p className={`${styles.large_device} ${styles.account_style}`}>0xAbCd...9876</p>

                <div className={`${styles.column_display} ${styles.account_displays}`}>
                    <p className={`${styles.account_style} `}>0xaBcD...1234</p>
                    <p className={styles.account_style}> 0xAbCd...9876</p>
                </div>
                {/* <div className={styles.mobile_display}>
                    <p className={styles.account_style}>0xD...14</p>
                    <p className={styles.account_style}>0xa...34</p>
                </div> */}

                <p className={styles.price}>Price</p>
                <p className={styles.side}>Buy</p>
                <p className={styles.type}>Limit</p>

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

                <OpenOrderStatus isFilled />
            </div>
            {buttonsDisplay}
            {menuButtons}
        </div>
    );

    const positionMatchesSelectedTokensTemp = true;

    const positionRowOrNull = positionMatchesSelectedTokensTemp ? positionRow : null;

    return (
        <>
            {positionRowOrNull}
            {modalOrNull}
        </>
    );
}

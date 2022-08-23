// Unfinished file - Currently not in used.

// START: Import React and Dongles
import { useState, MouseEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';
import { MenuItem, Menu } from '@material-ui/core';
import { Tooltip } from '@mui/material';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import JSX Functional Components
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import Modal from '../../../../Global/Modal/Modal';

// START: Import Local Files
import styles from './PositionCard.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import { useStyles } from '../../../../../utils/functions/styles';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import trimString from '../../../../../utils/functions/trimString';

// interface for React functional component props
interface PositionCardPropsIF {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    position: PositionIF;
    isAllPositionsEnabled: boolean;
    tokenAAddress: string;
    tokenBAddress: string;
    isAuthenticated: boolean;
    account?: string;
    isDenomBase: boolean;
    userPosition?: boolean;
    lastBlockNumber: number;
    chainId: string;
}
export default function PositionCard(props: PositionCardPropsIF) {
    const { position, tokenAAddress, tokenBAddress, account, chainId, userPosition } = props;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const location = useLocation();

    const currentLocation = location.pathname;
    const handleClick = (event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => {
        console.log('handleClick', event.currentTarget);
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        console.log('handleClose');
        setAnchorEl(null);
    };
    const classes = useStyles();

    const [isModalOpen, openModal, closeModal] = useModal();

    const [currentModal, setCurrentModal] = useState('edit');

    // MODAL FUNCTIONALITY
    let modalContent: ReactNode;
    let modalTitle;

    function openRemoveModal() {
        setCurrentModal('remove');
        openModal();
        handleClose();
    }

    function openHarvestModal() {
        setCurrentModal('harvest');
        openModal();
        handleClose();
    }
    function openDetailsModal() {
        setCurrentModal('details');
        openModal();
        handleClose();
    }
    //  END OF MODAL FUNCTIONALITY

    const ownerId = position ? position.user : null;

    const ensName = position?.userEnsName !== '' ? position.userEnsName : null;
    const ensNameTruncated = ensName ? trimString(ensName, 4, 3, '…') : null;
    const ownerIdTruncated = position ? trimString(position.user, 7, 0, '…') : null;
    const mobileOwnerId = position ? trimString(position.user, 4, 0, '…') : null;

    const positionData = {
        position: position,
    };

    let posHash;
    if (position.ambient) {
        posHash = ambientPosSlot(
            position.user,
            position.base,
            position.quote,
            lookupChain(chainId).poolIndex,
        );
    } else {
        posHash = concPosSlot(
            position.user,
            position.base,
            position.quote,
            position.bidTick,
            position.askTick,
            lookupChain(chainId).poolIndex,
        );
    }

    const truncatedPosHash = trimString(posHash as string, 6, 0, '…');

    const mobilePosHash = trimString(posHash as string, 4, 0, '…');

    let isPositionInRange = true;

    if (position.poolPriceInTicks) {
        if (position.ambient) {
            isPositionInRange = true;
        } else if (
            position.bidTick <= position.poolPriceInTicks &&
            position.poolPriceInTicks <= position.askTick
        ) {
            isPositionInRange = true;
        } else {
            isPositionInRange = false;
        }
    }

    const positionBaseAddressLowerCase = position.base.toLowerCase();
    const positionQuoteAddressLowerCase = position.quote.toLowerCase();

    const tokenAAddressLowerCase = tokenAAddress.toLowerCase();
    const tokenBAddressLowerCase = tokenBAddress.toLowerCase();

    const positionMatchesSelectedTokens =
        (positionBaseAddressLowerCase === tokenAAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenAAddressLowerCase) &&
        (positionBaseAddressLowerCase === tokenBAddressLowerCase ||
            positionQuoteAddressLowerCase === tokenBAddressLowerCase);

    const accountAddress = account ? account.toLowerCase() : null;

    const positionOwnedByConnectedAccount = ownerId === accountAddress;

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    const minRange = props.isDenomBase
        ? position.lowRangeDisplayInBase
        : position.lowRangeDisplayInQuote;
    const maxRange = props.isDenomBase
        ? position.highRangeDisplayInBase
        : position.highRangeDisplayInQuote;

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
                        state={positionData}
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

    const ambientRangeOrNull = position.ambient ? (
        <p className={styles.ambient_text}>ambient</p>
    ) : (
        `${minRange}- ${maxRange}`
    );

    const detailsButton = (
        <button className={styles.details_button} onClick={openDetailsModal}>
            Details
        </button>
    );

    const positionRow = (
        <div className={`${styles.container} `}>
            <div
                className={`${styles.position_row} ${userPosition ? styles.user_position : 'null'}`}
            >
                <Tooltip
                    title={(posHash as string) ? (posHash as string) : ''}
                    placement={'right'}
                    arrow
                    enterDelay={400}
                    leaveDelay={200}
                    classes={{
                        tooltip: classes.customTooltip,
                    }}
                >
                    <p className={`${styles.large_device} ${styles.account_style}`}>
                        {' '}
                        {truncatedPosHash}
                    </p>
                </Tooltip>

                <Tooltip
                    classes={{
                        tooltip: classes.customTooltip,
                        arrow: classes.customArrow,
                    }}
                    title={ensName ? ensName : ownerId ? ownerId : ''}
                    placement={'right'}
                    arrow
                    enterDelay={400}
                    leaveDelay={200}
                >
                    <p
                        className={`${styles.large_device} ${styles.account_style} ${
                            ensNameTruncated ? styles.ambient_text : null
                        }`}
                    >
                        {ensNameTruncated ? ensNameTruncated : ownerIdTruncated}
                    </p>
                </Tooltip>

                <div className={`${styles.column_display} ${styles.account_displays}`}>
                    <p
                        className={`${styles.account_style} ${
                            ensName ? styles.ambient_text : null
                        }`}
                    >
                        {ensNameTruncated ? ensNameTruncated : ownerIdTruncated}
                    </p>
                    <p className={styles.account_style}> {truncatedPosHash}</p>
                </div>
                <div className={styles.mobile_display}>
                    <p className={styles.account_style}>{mobileOwnerId}</p>
                    <p className={styles.account_style}>{mobilePosHash}</p>
                </div>

                <div className={`${''} ${styles.min_max}`}>{ambientRangeOrNull}</div>

                <p className={`${styles.large_device} ${styles.qty}`}>T1 Qty</p>
                <p className={`${styles.large_device} ${styles.qty}`}>T2 Qty</p>
                <div className={styles.column_display}>
                    <p className={styles.qty}>T1 Qty</p>
                    <p className={styles.qty}>T2 Qty</p>
                </div>
                <p className={`${''} ${styles.apy}`}>APY</p>
                <div className={styles.full_range}>
                    <RangeStatus isInRange={isPositionInRange} isAmbient={position.ambient} />{' '}
                </div>
                <div className={styles.range_icon}>
                    <RangeStatus
                        isInRange={isPositionInRange}
                        isAmbient={position.ambient}
                        justSymbol
                    />{' '}
                </div>
                {!isPositionInRange && positionOwnedByConnectedAccount ? (
                    <button className={`${styles.option_button} ${''}`}>Reposition</button>
                ) : (
                    <div></div>
                )}

                {userPosition ? loggedInUserButtons : detailsButton}
            </div>
        </div>
    );

    const positionRowOrNull = positionMatchesSelectedTokens ? positionRow : null;

    return (
        <>
            {positionRowOrNull}
            {modalOrNull}
        </>
    );
}

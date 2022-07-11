// Unfinished file - Currently not in used.
import { useModal } from '../Modal/useModal';
import Modal from '../Modal/Modal';
import styles from './PositionCard.module.css';
import { useState } from 'react';
import { MenuItem, Menu } from '@material-ui/core';
import { useStyles } from '../../../utils/functions/styles';
import { FiMoreHorizontal } from 'react-icons/fi';
import RangeStatus from '../RangeStatus/RangeStatus';
import { Position2 } from '../../../utils/state/graphDataSlice';

import RemoveRange from '../../RemoveRange/RemoveRange';
import RangeDetails from '../../RangeDetails/RangeDetails';
import RangeDetailsHeader from '../../RangeDetails/RangeDetailsHeader/RangeDetailsHeader';
import truncateAddress from '../../../utils/truncateAddress';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';

interface PositionCardProps {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    position: Position2;
    isAllPositionsEnabled: boolean;
    tokenAAddress: string;
    tokenBAddress: string;
    isAuthenticated: boolean;
    account?: string;
    isDenomBase: boolean;
}
export default function PositionCard(props: PositionCardProps) {
    const {
        position,
        isAllPositionsEnabled,
        tokenAAddress,
        tokenBAddress,
        account,
        notOnTradeRoute,
        isAuthenticated,
        portfolio,
    } = props;
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

    const [isModalOpen, openModal, closeModal] = useModal();

    const [currentModal, setCurrentModal] = useState<string>('edit');

    const harvestContent = <div>I am harvest</div>;
    const editContent = <div>I am edit</div>;

    // MODAL FUNCTIONALITY
    let modalContent: React.ReactNode;
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
    const ownerIdTruncated = position ? truncateAddress(position.user, 18) : null;

    const positionData = {
        position: position,
    };

    let posHash;
    if (position.ambient) {
        posHash = ambientPosSlot(position.user, position.base, position.quote);
    } else {
        posHash = concPosSlot(
            position.user,
            position.base,
            position.quote,
            position.bidTick,
            position.askTick,
        );
    }

    const truncatedPosHash = truncateAddress(posHash as string, 18);

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

    const displayAllOrOwned =
        isAllPositionsEnabled || (ownerId === accountAddress && isAuthenticated);
    const notDisplayAllOrOwned =
        !isAllPositionsEnabled || (ownerId === accountAddress && isAuthenticated);

    const removeRangeProps = {
        isPositionInRange: isPositionInRange,
        isAmbient: position.ambient,
        baseTokenSymbol: position.baseTokenSymbol,
        quoteTokenSymbol: position.quoteTokenSymbol,
        lowRangeDisplayInBase: position.lowRangeDisplayInBase,
        highRangeDisplayInBase: position.highRangeDisplayInBase,
        lowRangeDisplayInQuote: position.lowRangeDisplayInQuote,
        highRangeDisplayInQuote: position.highRangeDisplayInQuote,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: props.isDenomBase,
    };

    switch (currentModal) {
        case 'remove':
            modalContent = <RemoveRange {...removeRangeProps} />;
            modalTitle = 'Remove Position';
            break;
        case 'edit':
            modalContent = editContent;
            modalTitle = 'Edit Position';
            break;
        case 'details':
            modalContent = <RangeDetails {...removeRangeProps} />;
            modalTitle = <RangeDetailsHeader />;
            break;
        case 'harvest':
            modalContent = harvestContent;
            modalTitle = 'Harvest Position';
            break;
    }
    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    const rangeDisplay = props.isDenomBase
        ? `${position.lowRangeDisplayInBase} - ${position.highRangeDisplayInBase}`
        : `${position.lowRangeDisplayInQuote} - ${position.highRangeDisplayInQuote}`;

    return (
        <div className={styles.container}>
            <div className={styles.position_row}>
                <p
                    className={`${styles.hide_ipad} ${styles.account_style} ${
                        ensName ? styles.ambient_text : null
                    }`}
                >
                    {' '}
                    {ensName ? ensName : ownerIdTruncated}
                </p>
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
                    <MenuItem onClick={openHarvestModal} className={classes.menuItem}>
                        Harvest
                    </MenuItem>
                    <MenuItem onClick={handleClose} className={classes.menuItem}>
                        Edit
                    </MenuItem>
                    <MenuItem onClick={openRemoveModal} className={classes.menuItem}>
                        Remove
                    </MenuItem>
                    <MenuItem onClick={handleClose} className={classes.menuItem}>
                        Details
                    </MenuItem>
                </Menu>
            </div>
            {modalOrNull}
        </div>
    );
}

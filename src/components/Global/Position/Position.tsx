// START: Import React and Dongles
import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import Local Files
import styles from './Position.module.css';
import RangeStatus from '../RangeStatus/RangeStatus';
import Modal from '../Modal/Modal';
import { useModal } from '../Modal/useModal';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import trimString from '../../../utils/functions/trimString';

// interface for React functional component props
interface PositionPropsIF {
    portfolio?: boolean;
    notOnTradeRoute?: boolean;
    position: PositionIF;
    isAllPositionsEnabled: boolean;
    tokenAAddress: string;
    tokenBAddress: string;
    isAuthenticated: boolean;
    account?: string;
    isDenomBase: boolean;
    lastBlockNumber: number;
    chainId: string;
}

// React functional component
export default function Position(props: PositionPropsIF) {
    const {
        position,
        isAllPositionsEnabled,
        tokenAAddress,
        tokenBAddress,
        account,
        notOnTradeRoute,
        isAuthenticated,
        isDenomBase,
        chainId,
        portfolio,
    } = props;

    const location = useLocation();
    const currentLocation = location.pathname;

    const [isModalOpen, openModal, closeModal] = useModal();

    const [currentModal, setCurrentModal] = useState<string>('edit');

    // MODAL FUNCTIONALITY
    let modalContent: ReactNode;
    let modalTitle;

    function openRemoveModal() {
        setCurrentModal('remove');
        openModal();
    }

    function openHarvestModal() {
        setCurrentModal('harvest');
        openModal();
    }
    function openDetailsModal() {
        setCurrentModal('details');
        openModal();
    }
    //  END OF MODAL FUNCTIONALITY

    const tokenImages = (
        <>
            <td data-column='tokens' className={styles.tokens}>
                <img
                    src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                    alt='token'
                    width='30px'
                />
                <img
                    src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                    alt='token'
                    width='30px'
                />
            </td>
        </>
    );
    const ownerId = position ? position.user : null;

    const ensName = position?.ensResolution !== '' ? position.ensResolution : null;
    const ownerIdTruncated = position ? trimString(position.user, 6, 6, '…') : null;

    const positionData = {
        position: position,
    };

    let posHash;
    if (position.positionType === 'ambient') {
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

    const truncatedPosHash = trimString(posHash as string, 6, 6, '…');

    let isPositionInRange = true;

    if (position.poolPriceInTicks) {
        if (position.positionType === 'ambient') {
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

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    const rangeDisplay = isDenomBase
        ? `${position.lowRangeDisplayInBase} - ${position.highRangeDisplayInBase}`
        : `${position.lowRangeDisplayInQuote} - ${position.highRangeDisplayInQuote}`;

    const positionRowOrNull =
        notOnTradeRoute || (positionMatchesSelectedTokens && displayAllOrOwned) ? (
            <tr className={styles.position_tr}>
                {portfolio && tokenImages}
                {isAllPositionsEnabled && (
                    <td
                        data-column='Owner ID'
                        className={`${styles.position_id} ${ensName ? styles.ambient_text : null}`}
                    >
                        {ensName ? ensName : ownerIdTruncated}
                    </td>
                )}
                <td data-column='Position ID' className={styles.position_id}>
                    {truncatedPosHash}
                </td>
                {(position.positionType === 'ambient') == false && (
                    <td data-column='Range' className={styles.position_range}>
                        {rangeDisplay}
                    </td>
                )}
                {(position.positionType === 'ambient') == true && (
                    <td
                        data-column='Range'
                        className={`${styles.position_range} ${styles.ambient_text}`}
                    >
                        ambient
                    </td>
                )}
                <td data-column='APR' className={styles.apr}>
                    35.65%
                </td>
                <td data-column='Range Status'>
                    <RangeStatus
                        isInRange={isPositionInRange}
                        isAmbient={position.positionType === 'ambient'}
                    />
                    {/* In Range */}
                </td>
                <td data-column='' className={styles.option_buttons}>
                    <button className={styles.option_button} onClick={openDetailsModal}>
                        Details
                    </button>
                    {notDisplayAllOrOwned && (
                        <Link
                            to={`/trade/edit/${posHash}`}
                            state={positionData}
                            replace={currentLocation.startsWith('/trade/edit')}
                        >
                            <button className={styles.option_button}>Edit</button>
                        </Link>
                    )}
                    {notDisplayAllOrOwned && (
                        <button className={styles.option_button} onClick={openRemoveModal}>
                            Remove
                        </button>
                    )}

                    {notDisplayAllOrOwned && position.positionType !== 'ambient' && (
                        <button className={styles.option_button} onClick={openHarvestModal}>
                            Harvest
                        </button>
                    )}
                </td>
                {modalOrNull}
            </tr>
        ) : null;

    return positionRowOrNull;
}

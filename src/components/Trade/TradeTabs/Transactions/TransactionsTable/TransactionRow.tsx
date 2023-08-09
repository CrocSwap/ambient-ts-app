import styles from '../Transactions.module.css';
import {
    memo,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';

import TransactionDetailsModal from '../../../../Global/TransactionDetails/TransactionDetailsModal';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';

import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { txRowConstants } from '../txRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useModal } from '../../../../Global/Modal/useModal';

interface propsIF {
    tx: TransactionIF;
    ipadView: boolean;
    showColumns: boolean;
    showTimestamp: boolean;
    isAccountView: boolean;
}
function TransactionRow(props: propsIF) {
    const {
        showColumns,
        showTimestamp,
        ipadView,
        tx,
        isAccountView,
    } = props;

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
        txHash,
        txHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseQuantityDisplay,
        quoteQuantityDisplay,
        ownerId,
        truncatedDisplayPrice,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        sideType,
        type,
        usdValue,
        isOwnerActiveAccount,
        ensName,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,

        positiveDisplayStyle,
        negativeDisplayStyle,
        positiveArrow,
        negativeArrow,
        valueArrows,

        sideCharacter,
        priceCharacter,
        sideTypeStyle,
        isBuy,
        elapsedTimeString,
    } = useProcessTransaction(tx, userAddress, isAccountView);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);
    const {
        showAllData: showAllDataSelection,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
    } = useContext(TradeTableContext);

    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    // only show all data when on trade tab page
    const showAllData = !isAccountView && showAllDataSelection;

    const isOrderRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

    const activeTransactionStyle =
        tx.txId === currentTxActiveInTransactions
            ? styles.active_transaction_style
            : '';

    const userPositionStyle =
        userNameToDisplay === 'You' && showAllData
            ? `${styles.border_left} ${sideType}_style`
            : null;

    const usernameStyle =
        isOwnerActiveAccount && showAllData
            ? 'owned_tx_contrast'
            : ensName || userNameToDisplay === 'You'
            ? 'gradient_text'
            : 'username_base_color';

    const txDomId =
        tx.txId === currentTxActiveInTransactions ? `tx-${tx.txId}` : '';

    function scrollToDiv() {
        const element = document.getElementById(txDomId);

        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
        });
    }

    const activePositionRef = useRef(null);

    const clickOutsideHandler = () => {
        setCurrentTxActiveInTransactions('');
    };
    useOnClickOutside(activePositionRef, clickOutsideHandler);

    useEffect(() => {
        tx.txId === currentTxActiveInTransactions ? scrollToDiv() : null;
    }, [currentTxActiveInTransactions]);

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.txHash}`;
            window.open(explorerUrl);
        }
    }
    const [_, copy] = useCopyToClipboard();

    function handleCopyTxHash() {
        copy(txHash);
        openSnackbar(`${txHash} copied`, 'info');
    }

    const [highlightRow, setHighlightRow] = useState(false);
    const highlightStyle = highlightRow ? 'var(--dark2)' : '';
    const handleRowMouseDown = () => setHighlightRow(true);
    const handleRowMouseOut = () => setHighlightRow(false);

    function handleWalletCopy() {
        copy(ownerId);
        openSnackbar(`${ownerId} copied`, 'info');
    }

    const handleWalletClick = () => {
        if (!isAccountView) {
            const accountUrl = `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`;
            window.open(accountUrl);
        }
    };

    const handleKeyPress: React.KeyboardEventHandler<HTMLUListElement> = (
        event,
    ) => {
        if (event.key === 'Enter') {
            openDetailsModal();
        } else if (event.ctrlKey && event.key === 'c') {
            // These will be shortcuts for the row menu. I will implement these at another time. -JR
        }
    };

    const enterFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            openDetailsModal();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', enterFunction, false);
        return () => {
            document.removeEventListener('keydown', enterFunction, false);
        };
    }, []);

    const txRowConstantsProps = {
        handleCopyTxHash,
        handleOpenExplorer,
        txHashTruncated,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        sideTypeStyle,
        usdValue,
        usernameStyle,
        userNameToDisplay,
        baseTokenLogo,
        quoteTokenLogo,
        isAccountView,
        tx,
        elapsedTimeString,
        baseQuantityDisplay,
        quoteQuantityDisplay,
        isOwnerActiveAccount,
        ensName,
        ownerId,
        sideType,
        sideCharacter,
        isBuy,
        isOrderRemove,
        valueArrows,
        positiveArrow,
        positiveDisplayStyle,
        negativeDisplayStyle,
        negativeArrow,
        type,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        priceCharacter,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedDisplayPrice,

        handleWalletClick,
        handleWalletCopy,
    };

    const {
        IDWithTooltip,
        usdValueWithTooltip,
        walletWithTooltip,
        tokenPair,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        txIdColumnComponent,
        TxTimeWithTooltip,
        sideDisplay,
        baseQuoteQtyDisplayColumn,
        typeDisplay,
        typeAndSideColumn,
        ambientPriceDisplay,
        lowAndHighPriceDisplay,
        priceDisplay,
    } = txRowConstants(txRowConstantsProps);

    function handleRowClick() {
        if (tx.txId === currentTxActiveInTransactions) {
            return;
        }
        setCurrentTxActiveInTransactions('');
        openDetailsModal();
    }
    // end of portfolio page li element ---------------
    return (
        <>
            <ul
                className={`${styles.row_container} ${activeTransactionStyle} ${userPositionStyle} row_container_global`}
                style={{ backgroundColor: highlightStyle }}
                onClick={handleRowClick}
                id={txDomId}
                ref={currentTxActiveInTransactions ? activePositionRef : null}
                tabIndex={0}
                onKeyDown={handleKeyPress}
            >
                {showTimestamp && TxTimeWithTooltip}
                {isAccountView && tokenPair}
                {!showColumns && <li>{IDWithTooltip}</li>}
                {!showColumns && !isAccountView && <li>{walletWithTooltip}</li>}
                {showColumns && txIdColumnComponent}
                {!ipadView &&
                    (tx.entityType === 'liqchange'
                        ? tx.positionType === 'ambient'
                            ? ambientPriceDisplay
                            : lowAndHighPriceDisplay
                        : priceDisplay)}
                {!showColumns && sideDisplay}
                {!showColumns && typeDisplay}
                {showColumns && !ipadView && typeAndSideColumn}
                {usdValueWithTooltip}
                {!showColumns && baseQtyDisplayWithTooltip}
                {!showColumns && quoteQtyDisplayWithTooltip}
                {showColumns && baseQuoteQtyDisplayColumn}

                <li data-label='menu' className={styles.menu}>
                    <TransactionsMenu
                        tx={tx}
                        isAccountView={props.isAccountView}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        handleWalletClick={handleWalletClick}
                    />
                </li>
            </ul>
            {isDetailsModalOpen && (
                <TransactionDetailsModal
                    tx={tx}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    isAccountView={isAccountView}
                    onClose={closeDetailsModal}
                />
            )}
        </>
    );
}

export default memo(TransactionRow);

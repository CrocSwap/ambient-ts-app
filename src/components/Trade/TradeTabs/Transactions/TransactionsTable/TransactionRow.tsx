import { memo, useContext, useEffect, useRef } from 'react';
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
import { TransactionRow as TransactionRowStyled } from '../../../../../styled/Components/TransactionTable';

interface propsIF {
    tx: TransactionIF;
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
}
function TransactionRow(props: propsIF) {
    const { tableView, tx, isAccountView } = props;

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

        positiveDisplayColor,
        negativeDisplayColor,
        positiveArrow,
        negativeArrow,
        valueArrows,

        sideCharacter,
        priceCharacter,
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

    const usernameColor: 'text1' | 'accent1' | 'accent2' =
        isOwnerActiveAccount && showAllData
            ? 'accent2'
            : ensName || userNameToDisplay === 'You'
            ? 'accent1'
            : 'text1';

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

    const handleKeyPress: React.KeyboardEventHandler<HTMLDivElement> = (
        event,
    ) => {
        console.log('handleKeyPress');

        if (event.key === 'Enter') {
            openDetailsModal();
        } else if (event.ctrlKey && event.key === 'c') {
            // These will be shortcuts for the row menu. I will implement these at another time. -JR
        }
    };

    const txRowConstantsProps = {
        handleCopyTxHash,
        handleOpenExplorer,
        txHashTruncated,
        openDetailsModal,
        usdValue,
        usernameColor,
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
        positiveDisplayColor,
        negativeDisplayColor,
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
        console.log('handleRowClick');
        if (tx.txId === currentTxActiveInTransactions) {
            return;
        }
        setCurrentTxActiveInTransactions('');
        openDetailsModal();
    }
    // TODO: use media queries and standardized styles
    // end of portfolio page li element ---------------
    return (
        <>
            <TransactionRowStyled
                size={tableView}
                account={isAccountView}
                active={tx.txId === currentTxActiveInTransactions}
                user={userNameToDisplay === 'You' && showAllData}
                onClick={handleRowClick}
                id={txDomId}
                ref={currentTxActiveInTransactions ? activePositionRef : null}
                tabIndex={0}
                onKeyDown={handleKeyPress}
            >
                {tableView === 'large' && TxTimeWithTooltip}
                {isAccountView && tokenPair}
                {tableView === 'large' && <div>{IDWithTooltip}</div>}
                {tableView === 'large' && !isAccountView && (
                    <div>{walletWithTooltip}</div>
                )}
                {tableView !== 'large' && txIdColumnComponent}
                {tableView !== 'small' &&
                    (tx.entityType === 'liqchange'
                        ? tx.positionType === 'ambient'
                            ? ambientPriceDisplay
                            : lowAndHighPriceDisplay
                        : priceDisplay)}
                {tableView === 'large' && sideDisplay}
                {tableView === 'large' && typeDisplay}
                {tableView !== 'large' && typeAndSideColumn}
                {usdValueWithTooltip}
                {tableView === 'large' && baseQtyDisplayWithTooltip}
                {tableView === 'large' && quoteQtyDisplayWithTooltip}
                {tableView === 'medium' && baseQuoteQtyDisplayColumn}

                <div data-label='menu'>
                    <TransactionsMenu
                        tx={tx}
                        isAccountView={props.isAccountView}
                        isBaseTokenMoneynessGreaterOrEqual={
                            isBaseTokenMoneynessGreaterOrEqual
                        }
                        handleWalletClick={handleWalletClick}
                    />
                </div>
            </TransactionRowStyled>
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

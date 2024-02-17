import { memo, useContext, useEffect, useRef } from 'react';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { TransactionIF } from '../../../../../ambient-utils/types';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { txRowConstants } from '../txRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { TransactionRow as TransactionRowStyled } from '../../../../../styled/Components/TransactionTable';
import { UserDataContext } from '../../../../../contexts/UserDataContext';

interface propsIF {
    idForDOM: string;
    tx: TransactionIF;
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    openDetailsModal: () => void;
}
function TransactionRow(props: propsIF) {
    const { idForDOM, tableView, tx, isAccountView, openDetailsModal } = props;

    const { userAddress } = useContext(UserDataContext);

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
    const { showAllData: showAllDataSelection, currentTxActiveInTransactions } =
        useContext(TradeTableContext);

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

    function scrollToDiv() {
        const element = document.getElementById(idForDOM);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
        });
    }

    const activePositionRef = useRef(null);

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

    return (
        <>
            <TransactionRowStyled
                id={idForDOM}
                size={tableView}
                account={isAccountView}
                active={tx.txId === currentTxActiveInTransactions}
                user={userNameToDisplay === 'You' && showAllData}
                onClick={openDetailsModal}
                ref={currentTxActiveInTransactions ? activePositionRef : null}
                tabIndex={0}
                onKeyDown={handleKeyPress}
            >
                {tableView !== 'small' && TxTimeWithTooltip}
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
                        handleWalletClick={handleWalletClick}
                        openDetailsModal={openDetailsModal}
                    />
                </div>
            </TransactionRowStyled>
        </>
    );
}

export default memo(TransactionRow);

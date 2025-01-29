import { memo, MutableRefObject, useContext, useEffect, useRef } from 'react';
import { TransactionIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { TransactionRow as TransactionRowStyled } from '../../../../../styled/Components/TransactionTable';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { txRowConstants } from '../txRowConstants';

interface propsIF {
    idForDOM: string;
    tx: TransactionIF;
    tableView: 'small' | 'medium' | 'large';
    isAccountView: boolean;
    openDetailsModal: () => void;
    observedRowRef: MutableRefObject<HTMLDivElement | null> | undefined;
}
function TransactionRow(props: propsIF) {
    const {
        idForDOM,
        tableView,
        tx,
        isAccountView,
        openDetailsModal,
        observedRowRef,
    } = props;
    const { userAddress } = useContext(UserDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

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
        displayPriceNumInUsd,
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
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
        isBaseTokenMoneynessGreaterOrEqual,
        positionHash,
    } = useProcessTransaction(tx, userAddress, crocEnv, isAccountView);

    const {
        activeNetwork: { blockExplorer },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

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
            block: 'nearest',
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
            console.log({ sideType });
            const typeSuffix =
                type === 'range' && sideType !== 'remove'
                    ? '/liquidity'
                    : type === 'limit' &&
                        (sideType === 'buy' || sideType === 'sell')
                      ? '/limits'
                      : '/transactions';
            const accountUrl = `/${
                isOwnerActiveAccount
                    ? 'account' + typeSuffix
                    : ensName
                      ? ensName + typeSuffix
                      : ownerId + typeSuffix
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
        displayPriceNumInUsd,
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        priceCharacter,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedDisplayPrice,
        handleWalletClick,
        handleWalletCopy,
        isBaseTokenMoneynessGreaterOrEqual,
    };

    const {
        IDWithTooltip,
        usdValueWithTooltip,
        walletWithTooltip,
        tokenPair,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        TxTimeWithTooltip,
        sideDisplay,
        baseQuoteQtyDisplayColumn,
        typeDisplay,
        typeAndSideColumn,
        ambientPriceDisplay,
        lowAndHighPriceDisplay,
        priceDisplay,
        hiddenIDColumn,
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
                data-type='infinite-scroll-row'
            >
                {hiddenIDColumn}
                {tableView !== 'small' && TxTimeWithTooltip}
                {isAccountView && tokenPair}
                {(tableView === 'large' ||
                    (tableView === 'medium' && isAccountView)) && (
                    <div>{IDWithTooltip}</div>
                )}
                {!isAccountView && walletWithTooltip}
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

                <div data-label='menu' ref={observedRowRef}>
                    <TransactionsMenu
                        tx={tx}
                        isAccountView={props.isAccountView}
                        handleWalletClick={handleWalletClick}
                        openDetailsModal={openDetailsModal}
                        isOwnerActiveAccount={isOwnerActiveAccount}
                        positionHash={positionHash}
                    />
                </div>
            </TransactionRowStyled>
        </>
    );
}

export default memo(TransactionRow);

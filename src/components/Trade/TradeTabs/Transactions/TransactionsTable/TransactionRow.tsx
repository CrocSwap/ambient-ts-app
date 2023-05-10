import styles from '../Transactions.module.css';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import {
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';

import TransactionDetails from '../../../../Global/TransactionDetails/TransactionDetails';
import { tradeData } from '../../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';

import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { ChainSpec } from '@crocswap-libs/sdk';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { txRowConstants } from '../txRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';

interface propsIF {
    account: string;
    tx: TransactionIF;
    tradeData: tradeData;
    isTokenABase: boolean;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    ipadView: boolean;
    showPair: boolean;
    view2: boolean;
    showColumns: boolean;
    blockExplorer: string | undefined;
    handlePulseAnimation?: (type: string) => void;
    isOnPortfolioPage: boolean;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    chainData: ChainSpec;
}
function TransactionRow(props: propsIF) {
    const {
        account,
        showColumns,
        tradeData,
        ipadView,
        isTokenABase,
        tx,
        blockExplorer,
        handlePulseAnimation,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
        isOnPortfolioPage,
        showPair,
        setSimpleRangeWidth,
        chainData,
    } = props;

    const {
        txHash,
        txHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseQuantityDisplayShort,
        quoteQuantityDisplayShort,
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
    } = useProcessTransaction(tx, account, isOnPortfolioPage);

    const {
        globalModal: { open: openGlobalModal, close: closeGlobalModal },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const dispatch = useAppDispatch();

    const isOrderRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

    const openDetailsModal = () => {
        openGlobalModal(
            <TransactionDetails
                account={account}
                tx={tx}
                closeGlobalModal={closeGlobalModal}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isOnPortfolioPage={isOnPortfolioPage}
                chainData={chainData}
            />,
        );
    };

    const activeTransactionStyle =
        tx.id === currentTxActiveInTransactions
            ? styles.active_transaction_style
            : '';

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled
            ? styles.border_left
            : null;

    const usernameStyle =
        isOwnerActiveAccount && isShowAllEnabled
            ? 'owned_tx_contrast'
            : ensName || userNameToDisplay === 'You'
            ? 'gradient_text'
            : 'username_base_color';

    const txDomId =
        tx.id === currentTxActiveInTransactions ? `tx-${tx.id}` : '';

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
        tx.id === currentTxActiveInTransactions ? scrollToDiv() : null;
    }, [currentTxActiveInTransactions]);

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.tx}`;
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
        if (!isOnPortfolioPage)
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: true,
                }),
            );

        const accountUrl = `/${
            isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
        }`;
        window.open(accountUrl);
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
        isOnPortfolioPage,
        tx,
        elapsedTimeString,
        baseQuantityDisplayShort,
        quoteQuantityDisplayShort,
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

    // end of portfolio page li element ---------------
    return (
        <ul
            className={`${styles.row_container} ${activeTransactionStyle} ${userPositionStyle} row_container_global`}
            style={{ cursor: 'pointer', backgroundColor: highlightStyle }}
            onClick={() =>
                tx.id === currentTxActiveInTransactions
                    ? null
                    : setCurrentTxActiveInTransactions('')
            }
            id={txDomId}
            ref={currentTxActiveInTransactions ? activePositionRef : null}
            tabIndex={0}
            onKeyDown={handleKeyPress}
        >
            {!showColumns && TxTimeWithTooltip}
            {isOnPortfolioPage && showPair && tokenPair}
            {!showColumns && <li>{IDWithTooltip}</li>}
            {!showColumns && !isOnPortfolioPage && <li>{walletWithTooltip}</li>}
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
                    account={account}
                    userPosition={userNameToDisplay === 'You'}
                    tx={tx}
                    tradeData={tradeData}
                    isTokenABase={isTokenABase}
                    blockExplorer={blockExplorer}
                    isOnPortfolioPage={props.isOnPortfolioPage}
                    handlePulseAnimation={handlePulseAnimation}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    setSimpleRangeWidth={setSimpleRangeWidth}
                    chainData={chainData}
                    handleWalletClick={handleWalletClick}
                    isShowAllEnabled={isShowAllEnabled}
                />
            </li>
        </ul>
    );
}

export default memo(TransactionRow);

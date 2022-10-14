import styles from '../Transactions.module.css';
import { ITransaction } from '../../../../../utils/state/graphDataSlice';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';

interface TransactionRowPropsIF {
    tx: ITransaction;

    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    showSidebar: boolean;
    ipadView: boolean;
    showColumns: boolean;
    blockExplorer: string | undefined;

    openGlobalModal: (content: React.ReactNode) => void;
}
export default function TransactionRow(props: TransactionRowPropsIF) {
    const {
        showColumns,
        ipadView,
        tx,
        // showSidebar,
        blockExplorer,
        // openGlobalModal,
        // closeGlobalModal,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
    } = props;

    const {
        txHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,
        // isOrderFilled,
        truncatedDisplayPrice,
        sideType,

        type,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
        // orderMatchesSelectedTokens,
    } = useProcessTransaction(tx);

    const sideCharacter = isDenomBase ? baseTokenCharacter : quoteTokenCharacter;

    const sideTypeStyle = `${sideType}_style`;

    const openDetailsModal = () => console.log('opening detail modal');

    const activeTransactionStyle =
        tx.id === currentTxActiveInTransactions ? styles.active_transaction_style : '';

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled ? styles.border_left : null;

    const usernameStyle = ensName || isOwnerActiveAccount ? 'gradient_text' : 'base_color';

    const txDomId = tx.id === currentTxActiveInTransactions ? `tx-${tx.id}` : '';

    function scrollToDiv() {
        const element = document.getElementById(txDomId);

        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        tx.id === currentTxActiveInTransactions ? scrollToDiv() : null;
    }, [currentTxActiveInTransactions]);

    return (
        <ul
            className={`${styles.row_container} ${activeTransactionStyle} ${userPositionStyle}`}
            onClick={() =>
                tx.id === currentTxActiveInTransactions
                    ? null
                    : setCurrentTxActiveInTransactions('')
            }
            id={txDomId}
        >
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='id' className='base_color'>
                    {txHashTruncated}
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='wallet' className={usernameStyle}>
                    {userNameToDisplay}
                </li>
            )}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color'>{txHashTruncated}</p>{' '}
                    <p className={usernameStyle}>{userNameToDisplay}</p>
                </li>
            )}
            {!ipadView && (
                <li onClick={openDetailsModal} data-label='price' className={sideTypeStyle}>
                    {truncatedDisplayPrice}
                </li>
            )}

            {!showColumns && (
                <li onClick={openDetailsModal} data-label='side' className={sideTypeStyle}>
                    {`${sideType} ${sideCharacter}`}
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='type' className={sideTypeStyle}>
                    {type}
                </li>
            )}
            {showColumns && !ipadView && (
                <li data-label='side-type' className={sideTypeStyle}>
                    <p>{sideType}</p>
                    <p>{type}</p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value' className='gradient_text'>
                {' '}
                {usdValue}
            </li>

            {!showColumns && (
                <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='color_white'>
                    <p>{baseDisplay}</p>
                </li>
            )}
            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label={quoteTokenSymbol}
                    className='color_white'
                >
                    <p>{quoteDisplay}</p>
                </li>
            )}
            {showColumns && (
                <li data-label={baseTokenSymbol + quoteTokenSymbol} className='color_white'>
                    <p className={styles.align_center}>
                        {' '}
                        <img src={baseTokenLogo} alt='' width='15px' />
                        {baseDisplay}{' '}
                    </p>

                    <p className={styles.align_center}>
                        {' '}
                        <img src={quoteTokenLogo} alt='' width='15px' />
                        {quoteDisplay}
                    </p>
                </li>
            )}

            <li data-label='menu' style={{ width: showColumns ? '50px' : '100px' }}>
                {/* <OrdersMenu limitOrder={limitOrder} {...orderMenuProps} /> */}
                <TransactionsMenu
                    userPosition={userNameToDisplay === 'You'}
                    tx={tx}
                    blockExplorer={blockExplorer}
                />
            </li>
        </ul>
    );
}

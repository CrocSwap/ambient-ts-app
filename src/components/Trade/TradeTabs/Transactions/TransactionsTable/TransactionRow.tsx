import styles from '../Transactions.module.css';
import { ITransaction } from '../../../../../utils/state/graphDataSlice';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
// import { AiOutlineDash } from 'react-icons/ai';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import IconWithTooltip from '../../../../Global/IconWithTooltip/IconWithTooltip';
import TransactionDetails from '../../../../Global/TransactionDetails/TransactionDetails';
interface TransactionRowPropsIF {
    tx: ITransaction;
    isTokenABase: boolean;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    showSidebar: boolean;
    ipadView: boolean;
    showColumns: boolean;
    blockExplorer: string | undefined;
    closeGlobalModal: () => void;

    openGlobalModal: (content: React.ReactNode) => void;
    isOnPortfolioPage: boolean;
}
export default function TransactionRow(props: TransactionRowPropsIF) {
    const {
        showColumns,
        ipadView,
        isTokenABase,
        tx,
        showSidebar,
        blockExplorer,
        // openGlobalModal,
        // closeGlobalModal,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
        isOnPortfolioPage,
        closeGlobalModal,
        openGlobalModal,
    } = props;

    const {
        txHash,
        txHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,
        isBaseFlowPositive,
        isQuoteFlowPositive,
        // baseDisplayFrontend,
        // quoteDisplayFrontend,
        ownerId,
        // isOrderFilled,
        truncatedDisplayPrice,
        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        sideType,

        type,
        usdValue,
        txUsdValueLocaleString,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        // orderMatchesSelectedTokens,
    } = useProcessTransaction(tx);

    const sideCharacter = isDenomBase ? baseTokenCharacter : quoteTokenCharacter;

    const sideTypeStyle = `${sideType}_style`;

    const valueArrows = sideType !== 'add' && sideType !== 'remove';

    const baseFlowArrow =
        valueArrows && baseDisplay !== '0.00' ? (!isBaseFlowPositive ? '↑' : '↓') : null;
    const quoteFlowArrow =
        valueArrows && quoteDisplay !== '0.00' ? (!isQuoteFlowPositive ? '↑' : '↓') : null;

    const posOrNegativeBase = !isBaseFlowPositive ? styles.positive_value : styles.negative_value;
    const posOrNegativeQuote = !isQuoteFlowPositive ? styles.positive_value : styles.negative_value;

    const baseDisplayStyle =
        baseDisplay == '0.00' || !valueArrows ? styles.light_grey : posOrNegativeBase;
    const quoteDisplayStyle =
        quoteDisplay == '0.00' || !valueArrows ? styles.light_grey : posOrNegativeQuote;

    // console.log(baseDisplay);

    const openDetailsModal = () =>
        openGlobalModal(<TransactionDetails tx={tx} closeGlobalModal={closeGlobalModal} />);

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

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.tx}`;
            window.open(explorerUrl);
        }
    }

    const IDWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div onClick={handleOpenExplorer} style={{ cursor: 'pointer' }}>
                    {txHash}
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li onClick={openDetailsModal} data-label='id' className='base_color'>
                {txHashTruncated}
            </li>
        </DefaultTooltip>
    );

    const usdValueWithTooltip = (
        <DefaultTooltip
            interactive
            title={txUsdValueLocaleString}
            placement={'right-end'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='value'
                className='gradient_text'
                style={{ textAlign: 'right', fontFamily: 'monospace' }}
            >
                {' '}
                {usdValue}
            </li>
        </DefaultTooltip>
    );

    const walletWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ensName ? ensName : ownerId}</p>
                    <NavLink
                        to={`/${isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId}`}
                    >
                        View Account
                    </NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='wallet'
                className={usernameStyle}
                style={{ textTransform: 'lowercase' }}
            >
                {userNameToDisplay}
            </li>
        </DefaultTooltip>
    );

    const baseTokenLogoComponent =
        baseTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <div>
                        <p>{baseTokenSymbol}</p>
                        {/* <NavLink to={`/${ownerId}`}>View Account</NavLink> */}
                    </div>
                }
                placement={'top'}
                arrow
                enterDelay={750}
                leaveDelay={200}
            >
                <img src={baseTokenLogo} alt='base token' width='15px' />
            </DefaultTooltip>
        ) : (
            <IconWithTooltip title={`${baseTokenSymbol}`} placement='bottom'>
                <NoTokenIcon tokenInitial={tx.baseSymbol.charAt(0)} width='30px' />
            </IconWithTooltip>
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <div>
                        <p>{quoteTokenSymbol}</p>
                        {/* <NavLink to={`/${ownerId}`}>View Account</NavLink> */}
                    </div>
                }
                placement={'top'}
                arrow
                enterDelay={750}
                leaveDelay={200}
            >
                <img src={quoteTokenLogo} alt='quote token' width='15px' />
            </DefaultTooltip>
        ) : (
            <NoTokenIcon tokenInitial={tx.quoteSymbol.charAt(0)} width='25px' />
        );

    const tokensTogether = (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
            }}
        >
            {baseTokenLogoComponent}
            {quoteTokenLogoComponent}
        </div>
    );

    // portfolio page li element ---------------
    const accountTokenImages = (
        <li className={styles.token_images_account}>
            {/* {baseTokenLogoComponent}
            {quoteTokenLogoComponent} */}
            {tokensTogether}
            {/* <p>hello</p> */}
        </li>
    );

    const poolName = (
        <li className='base_color'>
            {baseTokenSymbol} / {quoteTokenSymbol}
        </li>
    );
    // end of portfolio page li element ---------------
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
            {isOnPortfolioPage && accountTokenImages}
            {isOnPortfolioPage && !showSidebar && poolName}
            {!showColumns && IDWithTooltip}
            {!showColumns && walletWithTooltip}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color' style={{ textAlign: 'center' }}>
                        {txHashTruncated}
                    </p>{' '}
                    <p
                        className={usernameStyle}
                        style={{ textTransform: 'lowercase', textAlign: 'center' }}
                    >
                        {userNameToDisplay}
                    </p>
                </li>
            )}
            {!ipadView &&
                (tx.entityType === 'liqchange' ? (
                    tx.positionType === 'ambient' ? (
                        <li
                            onClick={openDetailsModal}
                            data-label='price'
                            className={sideTypeStyle}
                            style={{ textAlign: 'right' }}
                        >
                            ambient
                        </li>
                    ) : (isDenomBase && !isOnPortfolioPage) ||
                      (!isBaseTokenMoneynessGreaterOrEqual && isOnPortfolioPage) ? (
                        <li
                            onClick={openDetailsModal}
                            data-label='price'
                            className={`${sideTypeStyle} `}
                        >
                            <p className={`${styles.align_right} ${styles.mono_font}`}>
                                {isOnPortfolioPage
                                    ? truncatedLowDisplayPriceDenomByMoneyness
                                    : truncatedLowDisplayPrice}
                            </p>
                            <p className={`${styles.align_right} ${styles.mono_font}`}>
                                {isOnPortfolioPage
                                    ? truncatedHighDisplayPriceDenomByMoneyness
                                    : truncatedHighDisplayPrice}
                            </p>
                        </li>
                    ) : (
                        <li onClick={openDetailsModal} data-label='price' className={sideTypeStyle}>
                            <p className={`${styles.align_right} ${styles.mono_font}`}>
                                {isOnPortfolioPage
                                    ? truncatedHighDisplayPriceDenomByMoneyness
                                    : truncatedHighDisplayPrice}
                            </p>
                            <p className={`${styles.align_right} ${styles.mono_font}`}>
                                {isOnPortfolioPage
                                    ? truncatedLowDisplayPriceDenomByMoneyness
                                    : truncatedLowDisplayPrice}
                            </p>
                        </li>
                    )
                ) : (
                    <li
                        onClick={openDetailsModal}
                        data-label='price'
                        className={`${styles.align_right} ${styles.mono_font} ${sideTypeStyle}`}
                    >
                        {isOnPortfolioPage
                            ? truncatedDisplayPriceDenomByMoneyness || '…'
                            : truncatedDisplayPrice || '…'}
                    </li>
                ))}

            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label='side'
                    className={sideTypeStyle}
                    style={{ textAlign: 'center' }}
                >
                    {tx.entityType === 'liqchange' || tx.entityType === 'limitOrder'
                        ? `${sideType}`
                        : `${sideType} ${sideCharacter}`}
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
            {usdValueWithTooltip}

            {/* {!showColumns && (
                <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='color_white'>
                    <p style={{ textAlign: 'right', fontFamily: 'monospace' }}>{baseDisplay}</p>
                </li>
            )}
            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label={quoteTokenSymbol}
                    className='color_white'
                >
                    <p style={{ textAlign: 'right', fontFamily: 'monospace' }}>{quoteDisplay}</p>
                </li>
            )} */}
            {
                <li
                    data-label={baseTokenSymbol + quoteTokenSymbol}
                    className='color_white'
                    style={{ textAlign: 'right' }}
                >
                    <p
                        className={`${styles.token_qty} ${baseDisplayStyle}`}
                        style={{ fontFamily: 'monospace' }}
                    >
                        {baseDisplay}
                        {baseFlowArrow}
                        {baseTokenLogoComponent}
                    </p>

                    <p
                        className={`${styles.token_qty} ${quoteDisplayStyle}`}
                        style={{ fontFamily: 'monospace' }}
                    >
                        {' '}
                        {quoteDisplay}
                        {quoteFlowArrow}
                        {quoteTokenLogoComponent}
                    </p>
                </li>
            }

            <li data-label='menu'>
                {/* <OrdersMenu limitOrder={limitOrder} {...orderMenuProps} /> */}
                <TransactionsMenu
                    userPosition={userNameToDisplay === 'You'}
                    tx={tx}
                    isTokenABase={isTokenABase}
                    blockExplorer={blockExplorer}
                    showSidebar={props.showSidebar}
                    openGlobalModal={props.openGlobalModal}
                    closeGlobalModal={props.closeGlobalModal}
                    isOnPortfolioPage={props.isOnPortfolioPage}
                />
            </li>
        </ul>
    );
}

import styles from '../Transactions.module.css';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import TransactionsMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/TransactionsMenu';
import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../../Global/StyledTooltip/StyledTooltip';
import { FiExternalLink } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import IconWithTooltip from '../../../../Global/IconWithTooltip/IconWithTooltip';
import TransactionDetails from '../../../../Global/TransactionDetails/TransactionDetails';
import { tradeData } from '../../../../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import moment from 'moment';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../../constants';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { ChainSpec } from '@crocswap-libs/sdk';

interface propsIF {
    account: string;
    tx: TransactionIF;
    tradeData: tradeData;
    isTokenABase: boolean;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    showSidebar: boolean;
    ipadView: boolean;
    showPair: boolean;
    view2: boolean;
    showColumns: boolean;
    blockExplorer: string | undefined;
    closeGlobalModal: () => void;
    handlePulseAnimation?: (type: string) => void;

    openGlobalModal: (content: React.ReactNode) => void;
    isOnPortfolioPage: boolean;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    chainData: ChainSpec;
}
export default function TransactionRow(props: propsIF) {
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
        closeGlobalModal,
        openGlobalModal,
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
        baseTokenSymbol,
        baseTokenAddress,
        quoteTokenSymbol,
        quoteTokenAddress,
        isOwnerActiveAccount,
        ensName,
        baseTokenCharacter,
        quoteTokenCharacter,
        isDenomBase,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
    } = useProcessTransaction(tx, account, isOnPortfolioPage);

    const dispatch = useAppDispatch();

    const sideCharacter = isOnPortfolioPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? quoteTokenCharacter
            : baseTokenCharacter
        : isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const priceCharacter = isOnPortfolioPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const sideTypeStyle = `${sideType}_style`;

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    const valueArrows = tx.entityType !== 'liqchange';

    const positiveArrow = '↑';
    const negativeArrow = '↓';

    const isBuy = tx.isBuy === true || tx.isBid === true;

    const isSellQtyZero =
        (isBuy && tx.baseFlow === '0') || (!isBuy && tx.quoteFlow === '0');
    const isBuyQtyZero =
        (!isBuy && tx.baseFlow === '0') || (isBuy && tx.quoteFlow === '0');
    const isOrderRemove =
        tx.entityType === 'limitOrder' && sideType === 'remove';

    const positiveDisplayStyle =
        baseQuantityDisplayShort === '0.00' ||
        !valueArrows ||
        (isOrderRemove ? isSellQtyZero : isBuyQtyZero) ||
        tx.source === 'manual'
            ? styles.light_grey
            : styles.positive_value;
    const negativeDisplayStyle =
        quoteQuantityDisplayShort === '0.00' ||
        !valueArrows ||
        (isOrderRemove ? isBuyQtyZero : isSellQtyZero)
            ? styles.light_grey
            : styles.negative_value;

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

    const [highlightRow, setHighlightRow] = useState(false);
    const highlightStyle = highlightRow ? 'var(--dark2)' : '';
    const handleRowMouseDown = () => setHighlightRow(true);
    const handleRowMouseOut = () => setHighlightRow(false);

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    onClick={handleOpenExplorer}
                    style={{
                        marginLeft: '-40px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {txHash + 'ㅤ'}
                    <FiExternalLink size={'12px'} />
                </div>
            } // invisible space character added
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={handleOpenExplorer}
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
            >
                {txHashTruncated}
            </li>
        </TextOnlyTooltip>
    );

    const usdValueWithTooltip = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={openDetailsModal}
            data-label='value'
            className={sideTypeStyle}
            style={{ textAlign: 'right' }}
        >
            {usdValue}
        </li>
    );

    const navigate = useNavigate();

    const handleWalletClick = () => {
        dispatch(
            setDataLoadingStatus({
                datasetName: 'lookupUserTxData',
                loadingStatus: true,
            }),
        );
        navigate(
            `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`,
        );
    };

    const walletWithTooltip = (
        <li
            onClick={handleWalletClick}
            data-label='wallet'
            className={`${usernameStyle} ${styles.hover_style}`}
            style={{ textTransform: 'lowercase' }}
        >
            {userNameToDisplay}
        </li>
    );

    const baseTokenLogoComponent =
        baseTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <p>
                        {baseTokenSymbol}
                        {`${
                            baseTokenSymbol === 'ETH'
                                ? ''
                                : ': ' + baseTokenAddress
                        }`}
                    </p>
                }
                placement={'left'}
                disableHoverListener={!isOnPortfolioPage}
                arrow
                enterDelay={750}
                leaveDelay={0}
            >
                <img src={baseTokenLogo} alt='base token' width={logoSizes} />
            </DefaultTooltip>
        ) : (
            <IconWithTooltip
                title={`${baseTokenSymbol}: ${baseTokenAddress}`}
                placement='bottom'
            >
                <NoTokenIcon
                    tokenInitial={tx.baseSymbol.charAt(0)}
                    width={logoSizes}
                />
            </IconWithTooltip>
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <div>
                        {quoteTokenSymbol}: {quoteTokenAddress}
                    </div>
                }
                placement={'left'}
                disableHoverListener={!isOnPortfolioPage}
                arrow
                enterDelay={750}
                leaveDelay={0}
            >
                <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
            </DefaultTooltip>
        ) : (
            <IconWithTooltip
                title={`${quoteTokenSymbol}: ${quoteTokenAddress}`}
                placement='right'
            >
                <NoTokenIcon
                    tokenInitial={tx.quoteSymbol.charAt(0)}
                    width={logoSizes}
                />
            </IconWithTooltip>
        );

    const pair =
        tx.base !== ZERO_ADDRESS
            ? [`${tx.baseSymbol}: ${tx.base}`, `${tx.quoteSymbol}: ${tx.quote}`]
            : [`${tx.quoteSymbol}: ${tx.quote}`];
    const tip = pair.join('\n');

    const tradeLinkPath =
        (tx.entityType.toLowerCase() === 'limitorder'
            ? '/trade/limit/'
            : tx.entityType.toLowerCase() === 'liqchange'
            ? '/trade/range/'
            : '/trade/market/') +
        'chain=' +
        tx.chainId +
        '&tokenA=' +
        tx.quote +
        '&tokenB=' +
        tx.base;

    const tokenPair = (
        <DefaultTooltip
            interactive
            title={<div style={{ whiteSpace: 'pre-line' }}>{tip}</div>}
            placement={'left'}
            arrow
            enterDelay={150}
            leaveDelay={0}
        >
            <li
                className='base_color'
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                <NavLink to={tradeLinkPath}>
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </NavLink>
            </li>
        </DefaultTooltip>
    );

    const elapsedTimeInSecondsNum = moment(Date.now()).diff(
        tx.time * 1000,
        'seconds',
    );

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 min. '
                : elapsedTimeInSecondsNum < 120
                ? '1 min. '
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} min. `
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour '
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hrs. `
                : elapsedTimeInSecondsNum < 172800
                ? '1 day '
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days `
            : 'Pending...';

    const TxTimeWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-70px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {moment(tx.time * 1000).format('MM/DD/YYYY HH:mm')}
                </p>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </li>
        </TextOnlyTooltip>
    );

    const baseQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label={baseTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                }}
            >
                {baseQuantityDisplayShort}
                {baseTokenLogoComponent}
            </div>
        </li>
    );
    const quoteQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label={quoteTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                }}
            >
                {quoteQuantityDisplayShort}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

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
        >
            {!showColumns && TxTimeWithTooltip}
            {isOnPortfolioPage && showPair && tokenPair}
            {!showColumns && IDWithTooltip}
            {!showColumns && !isOnPortfolioPage && walletWithTooltip}
            {showColumns && (
                <li data-label='id'>
                    <p
                        onClick={() => {
                            handleOpenExplorer();
                        }}
                        className={`base_color ${styles.hover_style}`}
                    >
                        {txHashTruncated}
                    </p>{' '}
                    {isOnPortfolioPage ? (
                        <p
                            className={`${usernameStyle}`}
                            style={{
                                textTransform: 'lowercase',
                                cursor: 'default',
                            }}
                        >
                            {userNameToDisplay}
                        </p>
                    ) : (
                        <NavLink
                            onClick={() => {
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'lookupUserTxData',
                                        loadingStatus: true,
                                    }),
                                );
                            }}
                            to={`/${
                                isOwnerActiveAccount
                                    ? 'account'
                                    : ensName
                                    ? ensName
                                    : ownerId
                            }`}
                        >
                            <p
                                className={`${usernameStyle} ${styles.hover_style}`}
                                style={{ textTransform: 'lowercase' }}
                            >
                                {userNameToDisplay}
                            </p>
                        </NavLink>
                    )}
                </li>
            )}
            {!ipadView &&
                (tx.entityType === 'liqchange' ? (
                    tx.positionType === 'ambient' ? (
                        <li
                            onMouseEnter={handleRowMouseDown}
                            onMouseLeave={handleRowMouseOut}
                            onClick={openDetailsModal}
                            data-label='price'
                            className={'gradient_text'}
                            style={{
                                textAlign: 'right',
                                textTransform: 'lowercase',
                            }}
                        >
                            ambient
                        </li>
                    ) : (
                        <li
                            onMouseEnter={handleRowMouseDown}
                            onMouseLeave={handleRowMouseOut}
                            onClick={openDetailsModal}
                            data-label='price'
                            className={`${sideTypeStyle}`}
                        >
                            <p className={`${styles.align_right} `}>
                                <span>
                                    {truncatedLowDisplayPrice
                                        ? priceCharacter
                                        : '…'}
                                </span>
                                <span>
                                    {isOnPortfolioPage
                                        ? truncatedLowDisplayPriceDenomByMoneyness
                                        : truncatedLowDisplayPrice}
                                </span>
                            </p>
                            <p className={`${styles.align_right} `}>
                                <span>
                                    {truncatedHighDisplayPrice
                                        ? priceCharacter
                                        : '…'}
                                </span>
                                <span>
                                    {isOnPortfolioPage
                                        ? truncatedHighDisplayPriceDenomByMoneyness
                                        : truncatedHighDisplayPrice}
                                </span>
                            </p>
                        </li>
                    )
                ) : (
                    <li
                        onMouseEnter={handleRowMouseDown}
                        onMouseLeave={handleRowMouseOut}
                        onClick={() => {
                            if (IS_LOCAL_ENV) {
                                console.debug({ isOnPortfolioPage });
                                console.debug({
                                    truncatedDisplayPriceDenomByMoneyness,
                                });
                            }
                            openDetailsModal();
                        }}
                        data-label='price'
                        className={`${styles.align_right}  ${sideTypeStyle}`}
                    >
                        {isOnPortfolioPage
                            ? (
                                  <p className={`${styles.align_right} `}>
                                      <span>
                                          {truncatedDisplayPriceDenomByMoneyness
                                              ? priceCharacter
                                              : '…'}
                                      </span>
                                      <span>
                                          {
                                              truncatedDisplayPriceDenomByMoneyness
                                          }
                                      </span>
                                  </p>
                              ) || '…'
                            : (
                                  <p className={`${styles.align_right} `}>
                                      <span>
                                          {truncatedDisplayPrice
                                              ? priceCharacter
                                              : '…'}
                                      </span>
                                      <span>{truncatedDisplayPrice}</span>
                                  </p>
                              ) || '…'}
                    </li>
                ))}
            {!showColumns && (
                <li
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                    onClick={openDetailsModal}
                    data-label='side'
                    className={sideTypeStyle}
                    style={{ textAlign: 'center' }}
                >
                    {tx.entityType === 'liqchange' ||
                    tx.entityType === 'limitOrder'
                        ? `${sideType}`
                        : `${sideType} ${sideCharacter}`}
                </li>
            )}
            {!showColumns && (
                <li
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                    onClick={openDetailsModal}
                    data-label='type'
                    className={sideTypeStyle}
                    style={{ textAlign: 'center' }}
                >
                    {type}
                </li>
            )}
            {showColumns && !ipadView && (
                <li
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                    data-label='side-type'
                    className={sideTypeStyle}
                    style={{ textAlign: 'center' }}
                    onClick={openDetailsModal}
                >
                    <p>{type}</p>
                    <p>
                        {tx.entityType === 'liqchange' ||
                        tx.entityType === 'limitOrder'
                            ? `${sideType}`
                            : `${sideType} ${sideCharacter}`}
                    </p>
                </li>
            )}
            {usdValueWithTooltip}
            {!showColumns && baseQtyDisplayWithTooltip}
            {!showColumns && quoteQtyDisplayWithTooltip}
            {showColumns && (
                <li
                    data-label={baseTokenSymbol + quoteTokenSymbol}
                    className='color_white'
                    style={{ textAlign: 'right' }}
                    onClick={() => {
                        openDetailsModal();
                    }}
                >
                    <div
                        className={`${styles.token_qty} ${positiveDisplayStyle}`}
                        style={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isBuy
                            ? isOrderRemove
                                ? baseQuantityDisplayShort
                                : quoteQuantityDisplayShort
                            : isOrderRemove
                            ? quoteQuantityDisplayShort
                            : baseQuantityDisplayShort}
                        {valueArrows ? positiveArrow : ' '}
                        {isBuy
                            ? isOrderRemove
                                ? baseTokenLogoComponent
                                : quoteTokenLogoComponent
                            : isOrderRemove
                            ? quoteTokenLogoComponent
                            : baseTokenLogoComponent}
                    </div>

                    <div
                        className={`${styles.token_qty} ${negativeDisplayStyle}`}
                        style={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isBuy
                            ? `${
                                  isOrderRemove
                                      ? quoteQuantityDisplayShort
                                      : baseQuantityDisplayShort
                              }${valueArrows ? negativeArrow : ' '}`
                            : `${
                                  isOrderRemove
                                      ? baseQuantityDisplayShort
                                      : quoteQuantityDisplayShort
                              }${valueArrows ? negativeArrow : ' '}`}
                        {isBuy
                            ? isOrderRemove
                                ? quoteTokenLogoComponent
                                : baseTokenLogoComponent
                            : isOrderRemove
                            ? baseTokenLogoComponent
                            : quoteTokenLogoComponent}
                    </div>
                </li>
            )}
            <li data-label='menu' className={styles.menu}>
                <TransactionsMenu
                    account={account}
                    userPosition={userNameToDisplay === 'You'}
                    tx={tx}
                    tradeData={tradeData}
                    isTokenABase={isTokenABase}
                    blockExplorer={blockExplorer}
                    showSidebar={props.showSidebar}
                    openGlobalModal={props.openGlobalModal}
                    closeGlobalModal={props.closeGlobalModal}
                    isOnPortfolioPage={props.isOnPortfolioPage}
                    handlePulseAnimation={handlePulseAnimation}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    setSimpleRangeWidth={setSimpleRangeWidth}
                    chainData={chainData}
                />
            </li>
        </ul>
    );
}

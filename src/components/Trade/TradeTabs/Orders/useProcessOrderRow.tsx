import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { NavLink } from 'react-router-dom';
import styles from './Orders.module.css';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import moment from 'moment';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';

interface Props {
    posHashTruncated: string;
    posHash: string;
    sellOrderStyle: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    // baseQuantityDisplayShort: string;
    quoteTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseDisplay: string;
    quoteDisplay: string;
    priceStyle: string;
    // quoteQuantityDisplayShort: string;
    elapsedTimeString: string;
    sideType: string;
    sideCharacter: string;
    // ensName: string | null;

    // ownerId: string;
    // positiveArrow: string;
    // positiveDisplayStyle: string;
    // negativeDisplayStyle: string;
    // negativeArrow: string;

    limitOrder: LimitOrderIF;

    // type: string;
    // truncatedLowDisplayPrice: string | undefined;
    // truncatedHighDisplayPrice: string | undefined;
    priceCharacter: string;
    // truncatedLowDisplayPriceDenomByMoneyness: string | undefined;
    // truncatedHighDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPrice: string | undefined;

    isOwnerActiveAccount: boolean;
    isOnPortfolioPage: boolean;
    isOrderFilled: boolean;
    // isBuy: boolean;
    // isOrderRemove: boolean;
    // valueArrows: boolean;

    handleCopyPosHash: () => void;
    // handleOpenExplorer: () => void;
    openDetailsModal: () => void;
    handleRowMouseDown: () => void;
    handleRowMouseOut: () => void;
    handleWalletLinkClick: () => void;
    handleWalletCopy: () => void;

    // tx: TransactionIF;
}
export const useProcessOrderRow = (props: Props) => {
    const {
        posHashTruncated,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        posHash,
        handleCopyPosHash,
        sellOrderStyle,
        usdValue,
        usernameStyle,
        userNameToDisplay,
        limitOrder,
        handleWalletCopy,
        handleWalletLinkClick,
        baseTokenLogo,
        quoteTokenLogo,
        isOwnerActiveAccount,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseDisplay,
        quoteDisplay,
        elapsedTimeString,
        isOnPortfolioPage,
        priceCharacter,
        priceStyle,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        sideType,
        sideCharacter,
        isOrderFilled,
    } = props;

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    const tradeLinkPath =
        '/trade/limit/' +
        'chain=' +
        limitOrder.chainId +
        '&tokenA=' +
        limitOrder.quote +
        '&tokenB=' +
        limitOrder.base;

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-60px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'default',

                        fontFamily: 'monospace',

                        whiteSpace: 'nowrap',
                        width: '440px',

                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}
                >
                    {posHash}
                    <FiCopy
                        style={{ cursor: 'pointer' }}
                        onClick={handleCopyPosHash}
                    />
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p
                onClick={openDetailsModal}
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
            >
                {posHashTruncated}
            </p>
        </TextOnlyTooltip>
    );

    const ValueWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label='value'
            className={sellOrderStyle}
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            {' '}
            {'$' + usdValue}
        </li>
    );

    const actualWalletWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    style={{
                        marginRight: '-80px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'default',

                        // width: '450px',
                    }}
                >
                    <p
                        style={{
                            fontFamily: 'monospace',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',

                            gap: '4px',
                        }}
                    >
                        {limitOrder.user}
                        <FiCopy
                            style={{ cursor: 'pointer' }}
                            size={'12px'}
                            onClick={() => handleWalletCopy()}
                        />

                        <FiExternalLink
                            style={{ cursor: 'pointer' }}
                            size={'12px'}
                            onClick={handleWalletLinkClick}
                        />
                    </p>
                </div>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p
                onClick={openDetailsModal}
                data-label='wallet'
                className={usernameStyle}
                style={{ textTransform: 'lowercase', fontFamily: 'monospace' }}
            >
                {userNameToDisplay}
            </p>
        </TextOnlyTooltip>
    );

    const walletWithoutTooltip = (
        <p
            // onClick={handleWalletClick}
            onClick={openDetailsModal}
            data-label='wallet'
            className={`${usernameStyle} ${styles.hover_style}`}
            style={{ textTransform: 'lowercase' }}
            tabIndex={0}
        >
            {userNameToDisplay}
        </p>
    );

    const walletWithTooltip = isOwnerActiveAccount
        ? walletWithoutTooltip
        : actualWalletWithTooltip;

    const baseTokenLogoComponent = baseTokenLogo ? (
        <img src={baseTokenLogo} alt='base token' width={logoSizes} />
    ) : (
        <NoTokenIcon
            tokenInitial={limitOrder.baseSymbol.charAt(0)}
            width={logoSizes}
        />
    );

    const quoteTokenLogoComponent = quoteTokenLogo ? (
        <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
    ) : (
        <NoTokenIcon
            tokenInitial={limitOrder.quoteSymbol.charAt(0)}
            width={logoSizes}
        />
    );

    const tokenPair = (
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <NavLink to={tradeLinkPath}>
                {baseTokenSymbol} / {quoteTokenSymbol}
            </NavLink>
        </li>
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
                {baseDisplay}
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
                {quoteDisplay}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const OrderTimeWithTooltip = limitOrder.timeFirstMint ? (
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
                    {moment(limitOrder.latestUpdateTime * 1000).format(
                        'MM/DD/YYYY HH:mm',
                    )}
                </p>
            }
            placement={'right'}
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
    ) : (
        <li
            onClick={openDetailsModal}
            style={{ textTransform: 'lowercase' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <p className='base_color'>{elapsedTimeString}</p>
        </li>
    );
    const txIdColumnComponent = (
        <li>
            {IDWithTooltip}
            {walletWithTooltip}
        </li>
    );

    const priceDisplay = (
        <li
            onClick={openDetailsModal}
            data-label='price'
            className={priceStyle + ' ' + sellOrderStyle}
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            {(
                <p className={`${styles.align_right} `}>
                    <span>{priceCharacter}</span>
                    <span>
                        {isOnPortfolioPage
                            ? truncatedDisplayPriceDenomByMoneyness
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
        </li>
    );

    const typeDisplay = (
        <li
            onClick={openDetailsModal}
            data-label='type'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            Order
        </li>
    );

    const sideDisplay = (
        <li
            style={{ textAlign: 'center' }}
            onClick={openDetailsModal}
            data-label='side'
            className={sellOrderStyle}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            {`${sideType} ${sideCharacter}`}
        </li>
    );

    const sideTypeColumn = (
        <li
            data-label='side-type'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
            onClick={openDetailsModal}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <p>Order</p>
            <p>{`${sideType} ${sideCharacter}`}</p>
        </li>
    );

    const tokensColumn = (
        <li
            data-label={baseTokenSymbol + quoteTokenSymbol}
            className='base_color'
            onClick={openDetailsModal}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                className={styles.token_qty}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {' '}
                {baseDisplay} {baseTokenLogoComponent}
            </div>

            <div
                className={styles.token_qty}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {' '}
                {quoteDisplay}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const statusDisplay = (
        <li
            onClick={openDetailsModal}
            data-label='status'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <OpenOrderStatus isFilled={isOrderFilled} />
            </div>
        </li>
    );

    return {
        IDWithTooltip,
        ValueWithTooltip,
        actualWalletWithTooltip,
        walletWithoutTooltip,
        walletWithTooltip,
        baseTokenLogoComponent,
        quoteTokenLogoComponent,
        tokenPair,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        OrderTimeWithTooltip,
        txIdColumnComponent,
        priceDisplay,
        typeDisplay,
        sideDisplay,
        sideTypeColumn,
        tokensColumn,
        statusDisplay,
    };
};

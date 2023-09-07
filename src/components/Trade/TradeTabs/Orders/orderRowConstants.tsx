import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
import styles from './Orders.module.css';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import moment from 'moment';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';

interface propsIF {
    posHashTruncated: string;
    posHash: string;
    sellOrderStyle: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    quoteTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    baseDisplay: string;
    quoteDisplay: string;
    originalPositionLiqBase: string;
    originalPositionLiqQuote: string;
    expectedPositionLiqBase: string;
    expectedPositionLiqQuote: string;
    priceStyle: string;
    elapsedTimeString: string;
    sideType: string;
    sideCharacter: string;
    limitOrder: LimitOrderIF;
    priceCharacter: string;
    truncatedDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPrice: string | undefined;
    isOwnerActiveAccount: boolean;
    isAccountView: boolean;
    ensName: string | null;
    isOrderFilled: boolean;
    isLimitOrderPartiallyFilled: boolean;
    fillPercentage: number;
    handleCopyPosHash: () => void;
    handleRowMouseDown: () => void;
    handleRowMouseOut: () => void;
    handleWalletLinkClick: () => void;
    handleWalletCopy: () => void;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

// * This file contains constants used in the rendering of order rows in the order table.
// * The constants define the structure of each order row and are used in the JSX of the parent component.
// * By extracting the constants into a separate file, we can keep the main component file clean and easier to read/maintain.

// * To use these constants in a component, simply import them from this file and reference them as needed.
export const orderRowConstants = (props: propsIF) => {
    const {
        posHashTruncated,
        ensName,
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
        elapsedTimeString,
        isAccountView,
        priceCharacter,
        priceStyle,
        truncatedDisplayPrice,
        truncatedDisplayPriceDenomByMoneyness,
        sideType,
        sideCharacter,
        isOrderFilled,
        handleRowMouseDown,
        handleRowMouseOut,
        baseTokenAddress,
        quoteTokenAddress,
        isLimitOrderPartiallyFilled,
        originalPositionLiqBase,
        originalPositionLiqQuote,
        expectedPositionLiqBase,
        expectedPositionLiqQuote,
        fillPercentage,
    } = props;

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    className={styles.id_tooltip_style}
                    onClick={(event) => event.stopPropagation()}
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
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
            >
                {posHashTruncated}
            </p>
        </TextOnlyTooltip>
    );

    const ValueWithTooltip = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='value'
            className={sellOrderStyle}
            style={{ textAlign: 'right' }}
            tabIndex={0}
        >
            {' '}
            {usdValue}
        </li>
    );

    const actualWalletWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    className={styles.wallet_tooltip_div}
                    onClick={(event) => event.stopPropagation()}
                >
                    <p className={styles.wallet_tooltip_p}>
                        <span
                            onClick={handleWalletLinkClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {limitOrder.user}
                        </span>
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
                data-label='wallet'
                className={`${usernameStyle} ${styles.mono_font}`}
                style={ensName ? { textTransform: 'lowercase' } : undefined}
            >
                {userNameToDisplay}
            </p>
        </TextOnlyTooltip>
    );

    const walletWithoutTooltip = (
        <p
            data-label='wallet'
            className={`${usernameStyle} ${styles.hover_style}`}
            style={{ textTransform: 'lowercase' }}
            tabIndex={0}
            onMouseOver={handleRowMouseDown}
            onMouseOut={handleRowMouseOut}
        >
            {userNameToDisplay}
        </p>
    );

    const walletWithTooltip = isOwnerActiveAccount
        ? walletWithoutTooltip
        : actualWalletWithTooltip;

    const baseTokenLogoComponent = (
        <TokenIcon
            token={baseToken}
            src={baseTokenLogo}
            alt={baseTokenSymbol}
            size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
        />
    );
    const quoteTokenLogoComponent = (
        <TokenIcon
            token={quoteToken}
            src={quoteTokenLogo}
            alt={quoteTokenSymbol}
            size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
        />
    );

    const tokenPair = (
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='tokens'
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink
                to={linkGenLimit.getFullURL({
                    chain: limitOrder.chainId,
                    tokenA: limitOrder.quote,
                    tokenB: limitOrder.base,
                    limitTick: limitOrder.isBid
                        ? limitOrder.askTick.toString()
                        : limitOrder.bidTick.toString(),
                })}
            >
                {baseTokenSymbol} / {quoteTokenSymbol}
            </NavLink>
        </li>
    );

    const baseQtyDisplayWithTooltip = (
        <li
            data-label={baseTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            tabIndex={0}
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
                {limitOrder.isBid
                    ? originalPositionLiqBase
                    : expectedPositionLiqBase}
                {baseTokenLogoComponent}
            </div>
        </li>
    );

    const quoteQtyDisplayWithTooltip = (
        <li
            data-label={quoteTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            tabIndex={0}
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
                {limitOrder.isBid
                    ? expectedPositionLiqQuote
                    : originalPositionLiqQuote}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const OrderTimeWithTooltip = limitOrder.timeFirstMint ? (
        <TextOnlyTooltip
            interactive
            title={
                <p className={styles.order_tooltip}>
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
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </li>
        </TextOnlyTooltip>
    ) : (
        <li
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
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='price'
            className={priceStyle + ' ' + sellOrderStyle}
            style={{ textAlign: 'right' }}
        >
            {(
                <p className={`${styles.align_right} `}>
                    <span>{priceCharacter}</span>
                    <span>
                        {isAccountView
                            ? truncatedDisplayPriceDenomByMoneyness
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
        </li>
    );

    const typeDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='type'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
        >
            Limit
        </li>
    );

    const sideDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='side'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
        >
            {`${sideType} ${sideCharacter}`}
        </li>
    );

    const sideTypeColumn = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='side-type'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
        >
            <p>Limit</p>
            <p>{`${sideType} ${sideCharacter}`}</p>
        </li>
    );

    const tokensColumn = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label={baseTokenSymbol + quoteTokenSymbol}
            className='base_color'
        >
            <div
                className={styles.token_qty}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {limitOrder.isBid
                    ? originalPositionLiqBase
                    : expectedPositionLiqBase}
                {baseTokenLogoComponent}
            </div>

            <div
                className={styles.token_qty}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {' '}
                {limitOrder.isBid
                    ? expectedPositionLiqQuote
                    : originalPositionLiqQuote}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const statusDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='status'
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <OpenOrderStatus
                    isFilled={isOrderFilled}
                    isLimitOrderPartiallyFilled={isLimitOrderPartiallyFilled}
                    fillPercentage={fillPercentage}
                />
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

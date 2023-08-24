import { FiCopy, FiExternalLink } from 'react-icons/fi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
import styles from './Transactions.module.css';
import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { IS_LOCAL_ENV } from '../../../../constants';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';

interface propsIF {
    txHashTruncated: string;
    sideTypeStyle: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    baseQuantityDisplay: string;
    quoteTokenLogo: string;
    quoteQuantityDisplay: string;
    elapsedTimeString: string;
    sideType: string;
    sideCharacter: string;
    ensName: string | null;
    ownerId: string;
    positiveArrow: string;
    positiveDisplayStyle: string;
    negativeDisplayStyle: string;
    negativeArrow: string;
    type: string;
    truncatedLowDisplayPrice: string | undefined;
    truncatedHighDisplayPrice: string | undefined;
    priceCharacter: string;
    truncatedLowDisplayPriceDenomByMoneyness: string | undefined;
    truncatedHighDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPrice: string | undefined;
    isOwnerActiveAccount: boolean;
    isAccountView: boolean;
    isBuy: boolean;
    isOrderRemove: boolean;
    valueArrows: boolean;
    handleCopyTxHash: () => void;
    handleOpenExplorer: () => void;
    openDetailsModal: () => void;
    handleRowMouseDown: () => void;
    handleRowMouseOut: () => void;
    handleWalletClick: () => void;
    handleWalletCopy: () => void;
    tx: TransactionIF;
}

// * This file contains constants used in the rendering of transaction rows in the transaction table.
// * The constants define the structure of each transaction row and are used in the JSX of the parent component.
// * By extracting the constants into a separate file, we can keep the main component file clean and easier to read/maintain.

// * To use these constants in a component, simply import them from this file and reference them as needed.
export const txRowConstants = (props: propsIF) => {
    const {
        handleCopyTxHash,
        handleOpenExplorer,
        txHashTruncated,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        sideTypeStyle,
        usdValue,
        ensName,
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
    } = props;

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined = tokens.getTokenByAddress(tx.base);
    const quoteToken: TokenIF | undefined = tokens.getTokenByAddress(tx.quote);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    className={styles.id_tooltip_style}
                    onClick={(event) => event.stopPropagation()}
                >
                    <span onClick={handleOpenExplorer}>
                        {' '}
                        {tx.txHash + 'ㅤ'}
                    </span>
                    <FiCopy size={'12px'} onClick={handleCopyTxHash} />{' '}
                    <FiExternalLink
                        size={'12px'}
                        onClick={handleOpenExplorer}
                    />
                </div>
            } // invisible space character added
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
                tabIndex={0}
            >
                {txHashTruncated}
            </p>
        </TextOnlyTooltip>
    );

    const usdValueWithTooltip = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='value'
            className={sideTypeStyle}
            style={{ textAlign: 'right' }}
            tabIndex={0}
        >
            {usdValue}
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
                        color: 'var(--text1)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    <p
                        className={`${styles.mono_font}`}
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',

                            gap: '4px',
                        }}
                    >
                        <span onClick={handleWalletClick}>{ownerId}</span>
                        <FiCopy
                            style={{ cursor: 'pointer' }}
                            size={'12px'}
                            onClick={() => handleWalletCopy()}
                        />

                        <FiExternalLink
                            style={{ cursor: 'pointer' }}
                            size={'12px'}
                            onClick={handleWalletClick}
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
                className={usernameStyle}
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
        >
            {userNameToDisplay}
        </p>
    );

    const walletWithTooltip = isOwnerActiveAccount
        ? walletWithoutTooltip
        : actualWalletWithTooltip;

    const baseTokenLogoComponent = (
        <DefaultTooltip
            interactive
            title={
                <p>
                    {tx.baseSymbol}
                    {`${tx.baseSymbol === 'ETH' ? '' : ': ' + tx.base}`}
                </p>
            }
            placement={'left'}
            disableHoverListener={!isAccountView}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <TokenIcon
                token={baseToken}
                src={baseTokenLogo}
                alt={tx.baseSymbol}
                size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
            />
        </DefaultTooltip>
    );

    const quoteTokenLogoComponent = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    {tx.quoteSymbol}: {tx.quote}
                </div>
            }
            placement={'left'}
            disableHoverListener={!isAccountView}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <TokenIcon
                token={quoteToken}
                src={quoteTokenLogo}
                alt={tx.quoteSymbol}
                size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
            />
        </DefaultTooltip>
    );

    const tradeLinkPath =
        (tx.entityType.toLowerCase() === 'limitorder'
            ? '/trade/limit/'
            : tx.entityType.toLowerCase() === 'liqchange'
            ? '/trade/pool/'
            : '/trade/market/') +
        formSlugForPairParams(tx.chainId, tx.quote, tx.base);

    const tokenPair = (
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink to={tradeLinkPath}>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </NavLink>
        </li>
    );

    const TxTimeWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-70px',
                        background: 'var(--dark3)',
                        color: 'var(--text1)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {moment(tx.txTime * 1000).format('MM/DD/YYYY HH:mm')}
                </p>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
                tabIndex={0}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </li>
        </TextOnlyTooltip>
    );

    const baseQtyDisplayWithTooltip = (
        <li
            data-label={tx.baseSymbol}
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
                {baseQuantityDisplay}
                {baseTokenLogoComponent}
            </div>
        </li>
    );
    const quoteQtyDisplayWithTooltip = (
        <li
            data-label={tx.quoteSymbol}
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
                {quoteQuantityDisplay}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const txIdColumnComponent = (
        <li>
            {IDWithTooltip}
            {walletWithTooltip}
        </li>
    );

    const sideDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='side'
            className={sideTypeStyle}
            style={{ textAlign: 'center' }}
            tabIndex={0}
        >
            {tx.entityType === 'liqchange' ||
            tx.changeType === 'burn' ||
            tx.changeType === 'recover'
                ? `${sideType}`
                : `${sideType} ${sideCharacter}`}
        </li>
    );

    const baseQuoteQtyDisplayColumn = (
        <li
            data-label={tx.baseSymbol + tx.quoteSymbol}
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
                        ? baseQuantityDisplay
                        : quoteQuantityDisplay
                    : isOrderRemove
                    ? quoteQuantityDisplay
                    : baseQuantityDisplay}
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
                              ? quoteQuantityDisplay
                              : baseQuantityDisplay
                      }${valueArrows ? negativeArrow : ' '}`
                    : `${
                          isOrderRemove
                              ? baseQuantityDisplay
                              : quoteQuantityDisplay
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
    );

    const typeDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='type'
            className={sideTypeStyle}
            style={{ textAlign: 'center' }}
            tabIndex={0}
        >
            {type}
        </li>
    );

    const typeAndSideColumn = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='side-type'
            className={sideTypeStyle}
            style={{ textAlign: 'center' }}
        >
            <p>{type}</p>
            <p>
                {tx.entityType === 'liqchange' ||
                tx.changeType === 'burn' ||
                tx.changeType === 'recover'
                    ? `${sideType}`
                    : `${sideType} ${sideCharacter}`}
            </p>
        </li>
    );

    const ambientPriceDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='price'
            className={'primary_color'}
            style={{
                textAlign: 'right',
                textTransform: 'lowercase',
            }}
            tabIndex={0}
        >
            ambient
        </li>
    );

    const lowAndHighPriceDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='price'
            className={`${sideTypeStyle}`}
            tabIndex={0}
        >
            <p className={`${styles.align_right} `}>
                <span>{truncatedLowDisplayPrice ? priceCharacter : '…'}</span>
                <span>
                    {isAccountView
                        ? truncatedLowDisplayPriceDenomByMoneyness
                        : truncatedLowDisplayPrice}
                </span>
            </p>
            <p className={`${styles.align_right} `}>
                <span>{truncatedHighDisplayPrice ? priceCharacter : '…'}</span>
                <span>
                    {isAccountView
                        ? truncatedHighDisplayPriceDenomByMoneyness
                        : truncatedHighDisplayPrice}
                </span>
            </p>
        </li>
    );

    const priceDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={() => {
                if (IS_LOCAL_ENV) {
                    console.debug({ isAccountView });
                    console.debug({
                        truncatedDisplayPriceDenomByMoneyness,
                    });
                }
                openDetailsModal();
            }}
            data-label='price'
            className={`${styles.align_right}  ${sideTypeStyle}`}
            tabIndex={0}
        >
            {(
                <p className={`${styles.align_right} `}>
                    <span>
                        {(
                            isAccountView
                                ? truncatedDisplayPriceDenomByMoneyness
                                : truncatedDisplayPrice
                        )
                            ? priceCharacter
                            : '…'}
                    </span>
                    <span>
                        {isAccountView
                            ? truncatedDisplayPriceDenomByMoneyness
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
        </li>
    );

    return {
        IDWithTooltip,
        usdValueWithTooltip,
        walletWithTooltip,
        tokenPair,
        TxTimeWithTooltip,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        txIdColumnComponent,
        sideDisplay,
        baseQuoteQtyDisplayColumn,
        typeDisplay,
        typeAndSideColumn,
        ambientPriceDisplay,
        lowAndHighPriceDisplay,
        priceDisplay,
    };
};

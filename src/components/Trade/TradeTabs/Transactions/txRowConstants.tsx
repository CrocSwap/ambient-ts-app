import { FiCopy, FiExternalLink } from 'react-icons/fi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';

import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
import styles from './Transactions.module.css';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';

interface Props {
    txHashTruncated: string;
    sideTypeStyle: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    baseQuantityDisplayShort: string;
    quoteTokenLogo: string;
    quoteQuantityDisplayShort: string;
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
    isOnPortfolioPage: boolean;
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
export const txRowConstants = (props: Props) => {
    const {
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

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div className={styles.id_tooltip_style}>
                    <span onClick={handleOpenExplorer}> {tx.tx + 'ㅤ'}</span>
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
                onClick={openDetailsModal}
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
            onClick={openDetailsModal}
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
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'default',
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
                        {ownerId}
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

    const baseTokenLogoComponent =
        baseTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <p>
                        {tx.baseSymbol}
                        {`${tx.baseSymbol === 'ETH' ? '' : ': ' + tx.base}`}
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
                title={`${tx.baseSymbol}: ${tx.base}`}
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
                        {tx.quoteSymbol}: {tx.quote}
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
                title={`${tx.quoteSymbol}: ${tx.quote}`}
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

    const tradeLinkPath =
        (tx.entityType.toLowerCase() === 'limitorder'
            ? '/trade/limit/'
            : tx.entityType.toLowerCase() === 'liqchange'
            ? '/trade/range/'
            : '/trade/market/') +
        formSlugForPairParams(tx.chainId, tx.quote, tx.base);

    const tokenPair = (
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
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
                tabIndex={0}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </li>
        </TextOnlyTooltip>
    );

    const baseQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
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
                {baseQuantityDisplayShort}
                {baseTokenLogoComponent}
            </div>
        </li>
    );
    const quoteQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
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
                {quoteQuantityDisplayShort}
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
            onClick={openDetailsModal}
            data-label='side'
            className={sideTypeStyle}
            style={{ textAlign: 'center' }}
            tabIndex={0}
        >
            {tx.entityType === 'liqchange' || tx.entityType === 'limitOrder'
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
    );

    const typeDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={openDetailsModal}
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
            onClick={openDetailsModal}
        >
            <p>{type}</p>
            <p>
                {tx.entityType === 'liqchange' || tx.entityType === 'limitOrder'
                    ? `${sideType}`
                    : `${sideType} ${sideCharacter}`}
            </p>
        </li>
    );

    const ambientPriceDisplay = (
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
            tabIndex={0}
        >
            ambient
        </li>
    );

    const lowAndHighPriceDisplay = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={openDetailsModal}
            data-label='price'
            className={`${sideTypeStyle}`}
            tabIndex={0}
        >
            <p className={`${styles.align_right} `}>
                <span>{truncatedLowDisplayPrice ? priceCharacter : '…'}</span>
                <span>
                    {isOnPortfolioPage
                        ? truncatedLowDisplayPriceDenomByMoneyness
                        : truncatedLowDisplayPrice}
                </span>
            </p>
            <p className={`${styles.align_right} `}>
                <span>{truncatedHighDisplayPrice ? priceCharacter : '…'}</span>
                <span>
                    {isOnPortfolioPage
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
                    console.debug({ isOnPortfolioPage });
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
                            isOnPortfolioPage
                                ? truncatedDisplayPriceDenomByMoneyness
                                : truncatedDisplayPrice
                        )
                            ? priceCharacter
                            : '…'}
                    </span>
                    <span>
                        {isOnPortfolioPage
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
        baseTokenLogoComponent,
        quoteTokenLogoComponent,
        pair,
        tradeLinkPath,
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

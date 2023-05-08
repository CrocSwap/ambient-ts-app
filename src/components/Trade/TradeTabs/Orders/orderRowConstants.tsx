import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { NavLink } from 'react-router-dom';
import styles from './Orders.module.css';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import moment from 'moment';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';

interface Props {
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
    priceStyle: string;
    elapsedTimeString: string;
    sideType: string;
    sideCharacter: string;

    limitOrder: LimitOrderIF;

    priceCharacter: string;

    truncatedDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPrice: string | undefined;

    isOwnerActiveAccount: boolean;
    isOnPortfolioPage: boolean;
    isOrderFilled: boolean;

    handleCopyPosHash: () => void;
    openDetailsModal: () => void;
    handleRowMouseDown: () => void;
    handleRowMouseOut: () => void;
    handleWalletLinkClick: () => void;
    handleWalletCopy: () => void;
}

// * This file contains constants used in the rendering of order rows in the order table.
// * The constants define the structure of each order row and are used in the JSX of the parent component.
// * By extracting the constants into a separate file, we can keep the main component file clean and easier to read/maintain.

// * To use these constants in a component, simply import them from this file and reference them as needed.
export const orderRowConstants = (props: Props) => {
    const {
        posHashTruncated,
        openDetailsModal,

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
        formSlugForPairParams(
            limitOrder.chainId,
            limitOrder.quote,
            limitOrder.base,
        );

    interface CustomLIPropsIF {
        children: React.ReactNode;
        className?: string | undefined;
        style?: React.CSSProperties | undefined;
        noClick?: boolean;
    }
    function CustomLI(props: CustomLIPropsIF) {
        const { children, className, style, noClick } = props;

        return (
            <li
                onClick={noClick ? undefined : openDetailsModal}
                className={className}
                style={style}
            >
                {children}
            </li>
        );
    }

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p className={styles.id_tooltip_style}>
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
        <CustomLI
            data-label='value'
            className={sellOrderStyle}
            style={{ textAlign: 'right' }}
        >
            {' '}
            {'$' + usdValue}
        </CustomLI>
    );

    const actualWalletWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div className={styles.wallet_tooltip_div}>
                    <p className={styles.wallet_tooltip_p}>
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
                className={`${usernameStyle} ${styles.mono_font}`}
                style={{ textTransform: 'lowercase' }}
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
        <CustomLI data-label='tokens' className='base_color'>
            <NavLink to={tradeLinkPath}>
                {baseTokenSymbol} / {quoteTokenSymbol}
            </NavLink>
        </CustomLI>
    );
    const baseQtyDisplayWithTooltip = (
        <CustomLI data-label={baseTokenSymbol} className='base_color'>
            <div className={styles.token_qty_tooltip}>
                {baseDisplay}
                {baseTokenLogoComponent}
            </div>
        </CustomLI>
    );
    const quoteQtyDisplayWithTooltip = (
        <CustomLI data-label={quoteTokenSymbol} className='base_color'>
            <div className={styles.token_qty_tooltip}>
                {quoteDisplay}
                {quoteTokenLogoComponent}
            </div>
        </CustomLI>
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
            <CustomLI style={{ textTransform: 'lowercase' }}>
                <p className='base_color'>{elapsedTimeString}</p>
            </CustomLI>
        </TextOnlyTooltip>
    ) : (
        <CustomLI style={{ textTransform: 'lowercase' }}>
            <p className='base_color'>{elapsedTimeString}</p>
        </CustomLI>
    );
    const txIdColumnComponent = (
        <li>
            {IDWithTooltip}
            {walletWithTooltip}
        </li>
    );

    const priceDisplay = (
        <CustomLI
            data-label='price'
            className={priceStyle + ' ' + sellOrderStyle}
            style={{ textAlign: 'right' }}
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
        </CustomLI>
    );

    const typeDisplay = (
        <CustomLI
            data-label='type'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
        >
            Order
        </CustomLI>
    );

    const sideDisplay = (
        <CustomLI
            data-label='side'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
        >
            {`${sideType} ${sideCharacter}`}
        </CustomLI>
    );

    const sideTypeColumn = (
        <CustomLI
            data-label='side-type'
            className={sellOrderStyle}
            style={{ textAlign: 'center' }}
        >
            <p>Order</p>
            <p>{`${sideType} ${sideCharacter}`}</p>
        </CustomLI>
    );

    const tokensColumn = (
        <CustomLI
            data-label={baseTokenSymbol + quoteTokenSymbol}
            className='base_color'
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
        </CustomLI>
    );

    const statusDisplay = (
        <CustomLI data-label='status'>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <OpenOrderStatus isFilled={isOrderFilled} />
            </div>
        </CustomLI>
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

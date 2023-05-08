import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import styles from './Ranges.module.css';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { NavLink } from 'react-router-dom';
import { ZERO_ADDRESS } from '../../../../constants';
import Medal from '../../../Global/Medal/Medal';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
interface Props {
    posHashTruncated: string;
    // sideTypeStyle: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    // baseQuantityDisplayShort: string;
    quoteTokenLogo: string;
    // quoteQuantityDisplayShort: string;
    // elapsedTimeString: string;
    // sideType: string;
    sideCharacter: string;
    // ensName: string | null;
    posHash: string;
    elapsedTimeString: string;

    ownerId: string;
    ambientOrMin: string;
    ambientOrMax: string;
    apyClassname: string | undefined;
    apyString: string | undefined;
    // negativeArrow: string;

    // type: string;
    // truncatedLowDisplayPrice: string | undefined;
    // truncatedHighDisplayPrice: string | undefined;
    // priceCharacter: string;
    // truncatedLowDisplayPriceDenomByMoneyness: string | undefined;
    minRangeDenomByMoneyness: string | undefined;
    maxRangeDenomByMoneyness: string | undefined;
    // truncatedDisplayPrice: string | undefined;

    isOwnerActiveAccount: boolean;
    isOnPortfolioPage: boolean;
    isAmbient: boolean;
    ipadView: boolean;
    isPositionInRange: boolean;
    // valueArrows: boolean;
    isLeaderboard: boolean | undefined;
    showColumns: boolean;
    rank: number | undefined;

    handleCopyPosHash: () => void;
    // handleOpenExplorer: () => void;
    openDetailsModal: () => void;
    handleRowMouseDown: () => void;
    handleRowMouseOut: () => void;
    handleWalletLinkClick: () => void;
    handleWalletCopy: () => void;

    position: PositionIF;
}
export default function rangeRowConstants(props: Props) {
    const {
        handleCopyPosHash,
        posHash,
        posHashTruncated,
        usdValue,
        openDetailsModal,

        handleWalletLinkClick,
        handleWalletCopy,
        ownerId,
        userNameToDisplay,
        isOwnerActiveAccount,
        usernameStyle,
        baseTokenLogo,
        quoteTokenLogo,
        position,
        baseTokenSymbol,
        quoteTokenSymbol,
        isLeaderboard,
        showColumns,
        rank,
        elapsedTimeString,

        maxRangeDenomByMoneyness,
        isOnPortfolioPage,
        isAmbient,

        minRangeDenomByMoneyness,
        ambientOrMin,
        ambientOrMax,
        sideCharacter,
        ipadView,
        apyClassname,
        apyString,
        isPositionInRange,
    } = props;

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

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
                <p
                    className={styles.id_tooltip_style}
                    onClick={(event) => event.stopPropagation()}
                >
                    {posHash.toString()}
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

    const valueWithTooltip = (
        <CustomLI
            data-label='value'
            className='base_color'
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
                    <p
                        className={styles.wallet_tooltip_p}
                        onClick={(event) => event.stopPropagation()}
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
            <img src={baseTokenLogo} alt='base token' width={logoSizes} />
        ) : (
            <NoTokenIcon
                tokenInitial={position.baseSymbol.charAt(0)}
                width={logoSizes}
            />
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
        ) : (
            <NoTokenIcon
                tokenInitial={position.quoteSymbol.charAt(0)}
                width={logoSizes}
            />
        );

    const pair =
        position.base !== ZERO_ADDRESS
            ? [
                  `${position.baseSymbol}: ${position.base}`,
                  `${position.quoteSymbol}: ${position.quote}`,
              ]
            : [`${position.quoteSymbol}: ${position.quote}`];
    // eslint-disable-next-line
    const tip = pair.join('\n');

    const tradeLinkPath =
        '/trade/range/chain=' +
        position.chainId +
        '&tokenA=' +
        position.quote +
        '&tokenB=' +
        position.base;

    const tokenPair = (
        <CustomLI className='base_color' noClick>
            <NavLink to={tradeLinkPath}>
                <div>
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </div>
            </NavLink>
        </CustomLI>
    );

    const idOrNull =
        !isLeaderboard && !showColumns ? <li> {IDWithTooltip}</li> : null;

    const rankingOrNull =
        isLeaderboard && !showColumns ? <Medal ranking={rank ?? 80} /> : null;

    const baseQtyDisplayWithTooltip = (
        <CustomLI data-label={baseTokenSymbol} className='base_color'>
            <div className={styles.base_display_div}>
                {position.positionLiqBaseTruncated || '0'}
                {baseTokenLogoComponent}
            </div>
        </CustomLI>
    );
    const quoteQtyDisplayWithTooltip = (
        <CustomLI data-label={quoteTokenSymbol} className='base_color'>
            <div className={styles.base_display_div}>
                {position.positionLiqQuoteTruncated || '0'}
                {quoteTokenLogoComponent}
            </div>
        </CustomLI>
    );

    const rangeTimeWithTooltip = (
        // <TextOnlyTooltip
        //     interactive
        //     title={
        //         ''
        //         // <p className={styles.range_time_p}>
        //         //     {moment(position.latestUpdateTime * 1000).format(
        //         //         'MM/DD/YYYY HH:mm',
        //         //     )}
        //         // </p>
        //     }
        //     placement={'right'}
        //     enterDelay={750}
        //     leaveDelay={0}
        // >
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

    const fullScreenMinDisplay = isAmbient ? (
        <CustomLI
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
        >
            <span>{'0.00'}</span>
        </CustomLI>
    ) : (
        <CustomLI
            data-label='min price'
            className='base_color'
            style={{ textAlign: 'right' }}
        >
            <span>{sideCharacter}</span>
            <span>
                {isOnPortfolioPage && !isAmbient
                    ? minRangeDenomByMoneyness || '…'
                    : ambientOrMin || '…'}
            </span>
        </CustomLI>
    );

    const fullScreenMaxDisplay = isAmbient ? (
        <CustomLI
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
        >
            <span
                style={{
                    fontSize: '20px',
                }}
            >
                {'∞'}
            </span>
        </CustomLI>
    ) : (
        <CustomLI
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
        >
            <span>{sideCharacter}</span>
            <span>
                {isOnPortfolioPage
                    ? maxRangeDenomByMoneyness || '…'
                    : ambientOrMax || '…'}
            </span>
        </CustomLI>
    );

    const columnNonAmbientPrice = showColumns && !ipadView && !isAmbient && (
        <CustomLI
            data-label='side-type'
            className='base_color'
            style={{ textAlign: 'right' }}
        >
            <p>
                <span>{sideCharacter}</span>
                <span>
                    {isOnPortfolioPage && !isAmbient
                        ? minRangeDenomByMoneyness || '…'
                        : ambientOrMin || '…'}
                </span>
            </p>
            <p>
                <span>{sideCharacter}</span>
                <span>
                    {isOnPortfolioPage
                        ? maxRangeDenomByMoneyness || '…'
                        : ambientOrMax || '…'}
                </span>
            </p>
        </CustomLI>
    );
    const columnAmbientPrice = showColumns && !ipadView && isAmbient && (
        <CustomLI
            data-label='side-type'
            className='base_color'
            style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
        >
            <p>
                <span
                    className='gradient_text'
                    style={{ textTransform: 'lowercase' }}
                >
                    {'ambient'}
                </span>
            </p>
        </CustomLI>
    );

    const tokenValues = (
        <CustomLI
            data-label={baseTokenSymbol + quoteTokenSymbol}
            className='base_color'
            style={{ textAlign: 'right' }}
        >
            <div
                className={styles.token_qty}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqBaseTruncated || '0'}
                {baseTokenLogoComponent}
            </div>

            <div
                className={styles.token_qty}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqQuoteTruncated || '0'}
                {quoteTokenLogoComponent}
            </div>
        </CustomLI>
    );

    const apyDisplay = (
        <CustomLI data-label='apy' style={{ textAlign: 'right' }}>
            {' '}
            <p className={apyClassname}>{apyString}</p>
        </CustomLI>
    );

    const rangeDisplay = (
        <CustomLI data-label='status' className='gradient_text'>
            <RangeStatus
                isInRange={isPositionInRange}
                isAmbient={isAmbient}
                isEmpty={position.totalValueUSD === 0}
                justSymbol
            />
        </CustomLI>
    );

    return {
        valueWithTooltip,
        walletWithTooltip,

        tokenPair,
        idOrNull,
        rankingOrNull,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        rangeTimeWithTooltip,
        txIdColumnComponent,
        fullScreenMinDisplay,
        fullScreenMaxDisplay,
        columnNonAmbientPrice,
        columnAmbientPrice,
        tokenValues,
        apyDisplay,
        rangeDisplay,
    };
}

import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import styles from './Ranges.module.css';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
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
        handleRowMouseDown,
        handleRowMouseOut,
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
                onClick={openDetailsModal}
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
            >
                {posHashTruncated}
            </p>
        </TextOnlyTooltip>
    );

    const valueWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label='value'
            className='base_color'
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
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <NavLink to={tradeLinkPath}>
                <p>
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </p>
            </NavLink>
        </li>
    );

    const idOrNull =
        !isLeaderboard && !showColumns ? <li> {IDWithTooltip}</li> : null;

    const rankingOrNull =
        isLeaderboard && !showColumns ? <Medal ranking={rank ?? 80} /> : null;

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
                    alignItems: 'end',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqBaseTruncated || '0'}
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
                    alignItems: 'end',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqQuoteTruncated || '0'}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const rangeTimeWithTooltip = (
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
                    {moment(position.latestUpdateTime * 1000).format(
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
    );

    const txIdColumnComponent = (
        <li>
            {IDWithTooltip}
            {walletWithTooltip}
        </li>
    );

    const ambientPriceDisplay = (
        <li
            onClick={openDetailsModal}
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <span>{'0.00'}</span>
        </li>
    );

    const fullScreenMinDisplay = isAmbient ? (
        <li
            onClick={openDetailsModal}
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <span>{'0.00'}</span>
        </li>
    ) : (
        <li
            onClick={openDetailsModal}
            data-label='min price'
            className='base_color'
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <span>{sideCharacter}</span>
            <span>
                {isOnPortfolioPage && !isAmbient
                    ? minRangeDenomByMoneyness || '…'
                    : ambientOrMin || '…'}
            </span>
        </li>
    );

    const fullScreenMaxDisplay = isAmbient ? (
        <li
            onClick={openDetailsModal}
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <span
                style={{
                    fontSize: '20px',
                }}
            >
                {'∞'}
            </span>
        </li>
    ) : (
        <li
            onClick={openDetailsModal}
            data-label='max price'
            className='base_color'
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <span>{sideCharacter}</span>
            <span>
                {isOnPortfolioPage
                    ? maxRangeDenomByMoneyness || '…'
                    : ambientOrMax || '…'}
            </span>
        </li>
    );

    const columnNonAmbientPrice = showColumns && !ipadView && !isAmbient && (
        <li
            data-label='side-type'
            className='base_color'
            style={{ textAlign: 'right' }}
            onClick={openDetailsModal}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
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
        </li>
    );
    const columnAmbientPrice = showColumns && !ipadView && isAmbient && (
        <li
            data-label='side-type'
            className='base_color'
            style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
            onClick={openDetailsModal}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <p>
                <span
                    className='gradient_text'
                    style={{ textTransform: 'lowercase' }}
                >
                    {'ambient'}
                </span>
            </p>
        </li>
    );

    const tokenValues = (
        <li
            data-label={baseTokenSymbol + quoteTokenSymbol}
            className='base_color'
            style={{ textAlign: 'right' }}
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
        </li>
    );

    const apyDisplay = (
        <li
            onClick={openDetailsModal}
            data-label='apy'
            style={{ textAlign: 'right' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            {' '}
            <p className={apyClassname}>{apyString}</p>
        </li>
    );

    const rangeDisplay = (
        <li
            onClick={openDetailsModal}
            data-label='status'
            className='gradient_text'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <RangeStatus
                isInRange={isPositionInRange}
                isAmbient={isAmbient}
                isEmpty={position.totalValueUSD === 0}
                justSymbol
            />
        </li>
    );

    return {
        IDWithTooltip,
        valueWithTooltip,
        actualWalletWithTooltip,
        walletWithoutTooltip,
        walletWithTooltip,
        baseTokenLogoComponent,
        quoteTokenLogoComponent,
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

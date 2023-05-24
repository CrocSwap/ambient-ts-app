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
import { useUrlPath, linkGenMethodsIF } from '../../../../utils/hooks/useUrlPath';
interface Props {
    posHashTruncated: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    quoteTokenLogo: string;
    sideCharacter: string;
    posHash: string;
    elapsedTimeString: string;
    ownerId: string;
    ambientOrMin: string;
    ambientOrMax: string;
    apyClassname: string | undefined;
    apyString: string | undefined;
    minRangeDenomByMoneyness: string | undefined;
    maxRangeDenomByMoneyness: string | undefined;
    isOwnerActiveAccount: boolean;
    isOnPortfolioPage: boolean;
    isAmbient: boolean;
    ipadView: boolean;
    isPositionInRange: boolean;
    isLeaderboard: boolean | undefined;
    showColumns: boolean;
    rank: number | undefined;
    handleCopyPosHash: () => void;
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
        handleRowMouseDown,
        handleRowMouseOut,
    } = props;

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

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
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                {posHashTruncated}
            </p>
        </TextOnlyTooltip>
    );

    const valueWithTooltip = (
        <li
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
                <div className={styles.wallet_tooltip_div}>
                    <p
                        className={styles.wallet_tooltip_p}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <span
                            onClick={handleWalletLinkClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {ownerId}
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
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
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
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
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
                tokenInitial={position.baseSymbol?.charAt(0)}
                width={logoSizes}
            />
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
        ) : (
            <NoTokenIcon
                tokenInitial={position.quoteSymbol?.charAt(0)}
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

    // hook to generate navigation actions with pre-loaded path
    const linkGenRange: linkGenMethodsIF = useUrlPath('range');

    const tokenPair = (
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink to={
                linkGenRange.getFullURL({
                    chain: position.chainId,
                    tokenA: position.quote,
                    tokenB: position.base,
                })
            }>
                <div>
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </div>
            </NavLink>
        </li>
    );

    const idOrNull =
        !isLeaderboard && !showColumns ? <li> {IDWithTooltip}</li> : null;

    const rankingOrNull =
        isLeaderboard && !showColumns ? <Medal ranking={rank ?? 80} /> : null;

    const baseQtyDisplayWithTooltip = (
        <li
            data-label={baseTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div className={styles.base_display_div}>
                {position.positionLiqBaseTruncated || '0'}
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
        >
            <div className={styles.base_display_div}>
                {position.positionLiqQuoteTruncated || '0'}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    const rangeTimeWithTooltip = (
        <li
            style={{ textTransform: 'lowercase' }}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <p className='base_color'>{elapsedTimeString}</p>
        </li>
    );

    const txIdColumnComponent = (
        <li onMouseEnter={handleRowMouseDown} onMouseLeave={handleRowMouseOut}>
            {IDWithTooltip}
            {walletWithTooltip}
        </li>
    );

    const fullScreenMinDisplay = isAmbient ? (
        <li
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
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
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
        </li>
    ) : (
        <li
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
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
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
        </li>
    );

    const apyDisplay = (
        <li
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

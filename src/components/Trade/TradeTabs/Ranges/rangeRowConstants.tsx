import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { NavLink } from 'react-router-dom';
import { ZERO_ADDRESS } from '../../../../constants';
import Medal from '../../../Global/Medal/Medal';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';
interface propsIF {
    posHashTruncated: string;
    usdValue: string;
    usernameColor: 'accent1' | 'accent2' | 'text1';
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
    isAccountView: boolean;
    isAmbient: boolean;
    isPositionInRange: boolean;
    isLeaderboard: boolean | undefined;
    rank: number | undefined;
    ensName: string | null;
    handleCopyPosHash: () => void;
    handleWalletLinkClick: () => void;
    handleWalletCopy: () => void;
    position: PositionIF;
    baseTokenAddress: string;
    quoteTokenAddress: string;
}

export default function rangeRowConstants(props: propsIF) {
    const {
        handleCopyPosHash,
        posHash,
        ensName,
        posHashTruncated,
        usdValue,
        handleWalletLinkClick,
        handleWalletCopy,
        ownerId,
        userNameToDisplay,
        isOwnerActiveAccount,
        usernameColor,
        baseTokenLogo,
        quoteTokenLogo,
        position,
        baseTokenSymbol,
        quoteTokenSymbol,
        isLeaderboard,
        rank,
        elapsedTimeString,
        maxRangeDenomByMoneyness,
        isAccountView,
        isAmbient,
        minRangeDenomByMoneyness,
        ambientOrMin,
        ambientOrMax,
        sideCharacter,
        apyClassname,
        apyString,
        isPositionInRange,
        baseTokenAddress,
        quoteTokenAddress,
    } = props;

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-60px',
                        background: 'var(--dark3)',
                        color: 'var(--text1)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--roboto)',
                        whiteSpace: 'nowrap',
                        width: '438px',
                    }}
                    onClick={(event) => event.stopPropagation()}
                >
                    {posHash.toString()}
                    <FiCopy
                        style={{ cursor: 'pointer', margin: '0 8px' }}
                        onClick={handleCopyPosHash}
                    />
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <RowItem hover font='roboto' role='button' data-label='id'>
                {posHashTruncated}
            </RowItem>
        </TextOnlyTooltip>
    );

    const valueWithTooltip = (
        <FlexContainer
            justifyContent='flex-end'
            alignItems='center'
            data-label='value'
            className='base_color'
        >
            {'$' + usdValue}
        </FlexContainer>
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
                    <RowItem
                        font='roboto'
                        gap={4}
                        role='button'
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <span onClick={handleWalletLinkClick}>{ownerId}</span>
                        <FiCopy
                            size={'12px'}
                            onClick={() => handleWalletCopy()}
                        />

                        <FiExternalLink
                            size={'12px'}
                            onClick={handleWalletLinkClick}
                        />
                    </RowItem>
                </div>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <RowItem
                color={usernameColor}
                font={usernameColor === 'text1' ? 'roboto' : undefined}
                style={ensName ? { textTransform: 'lowercase' } : undefined}
            >
                {userNameToDisplay}
            </RowItem>
        </TextOnlyTooltip>
    );

    const walletWithoutTooltip = (
        <RowItem
            hover
            color={usernameColor}
            font={usernameColor === 'text1' ? 'roboto' : undefined}
            data-label='wallet'
            style={{ textTransform: 'lowercase' }}
            tabIndex={0}
        >
            {userNameToDisplay}
        </RowItem>
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
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const tokenPair = (
        <div
            className='base_color'
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink
                to={linkGenPool.getFullURL({
                    chain: position.chainId,
                    tokenA: position.quote,
                    tokenB: position.base,
                })}
            >
                <div>
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </div>
            </NavLink>
        </div>
    );

    const rankingOrNull = isLeaderboard ? <Medal ranking={rank ?? 80} /> : null;

    const baseQtyDisplayWithTooltip = (
        <div data-label={baseTokenSymbol} className='base_color'>
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                {position.positionLiqBaseTruncated || '0'}
                {baseTokenLogoComponent}
            </FlexContainer>
        </div>
    );
    const quoteQtyDisplayWithTooltip = (
        <div data-label={quoteTokenSymbol} className='base_color'>
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                {position.positionLiqQuoteTruncated || '0'}
                {quoteTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const rangeTimeWithTooltip = (
        <div style={{ textTransform: 'lowercase' }}>
            <p className='base_color'>{elapsedTimeString}</p>
        </div>
    );

    const txIdColumnComponent = (
        <div>
            {IDWithTooltip}
            {walletWithTooltip}
        </div>
    );

    const fullScreenMinDisplay = isAmbient ? (
        <FlexContainer
            justifyContent='flex-end'
            data-label='max price'
            className='base_color'
        >
            <span>{'0.00'}</span>
        </FlexContainer>
    ) : (
        <FlexContainer
            justifyContent='flex-end'
            data-label='min price'
            className='base_color'
        >
            <span>{sideCharacter}</span>
            <span>
                {isAccountView && !isAmbient
                    ? minRangeDenomByMoneyness || '…'
                    : ambientOrMin || '…'}
            </span>
        </FlexContainer>
    );

    const fullScreenMaxDisplay = isAmbient ? (
        <FlexContainer
            justifyContent='flex-end'
            data-label='max price'
            className='base_color'
        >
            <span
                style={{
                    fontSize: '20px',
                }}
            >
                {'∞'}
            </span>
        </FlexContainer>
    ) : (
        <FlexContainer
            justifyContent='flex-end'
            data-label='max price'
            className='base_color'
        >
            <span>{sideCharacter}</span>
            <span>
                {isAccountView
                    ? maxRangeDenomByMoneyness || '…'
                    : ambientOrMax || '…'}
            </span>
        </FlexContainer>
    );

    const priceDisplay = !isAmbient ? (
        <FlexContainer
            flexDirection='column'
            alignItems='flex-end'
            data-label='side-type'
            className='base_color'
        >
            <p>
                <span>{sideCharacter}</span>
                <span>
                    {isAccountView && !isAmbient
                        ? minRangeDenomByMoneyness || '…'
                        : ambientOrMin || '…'}
                </span>
            </p>
            <p>
                <span>{sideCharacter}</span>
                <span>
                    {isAccountView
                        ? maxRangeDenomByMoneyness || '…'
                        : ambientOrMax || '…'}
                </span>
            </p>
        </FlexContainer>
    ) : (
        <FlexContainer
            justifyContent='flex-end'
            data-label='side-type'
            className='base_color'
            style={{ whiteSpace: 'nowrap' }}
        >
            <p>
                <span
                    className='primary_color'
                    style={{ textTransform: 'lowercase' }}
                >
                    {'ambient'}
                </span>
            </p>
        </FlexContainer>
    );

    const tokenValues = (
        <div
            data-label={baseTokenSymbol + quoteTokenSymbol}
            className='base_color'
        >
            <FlexContainer
                justifyContent='flex-end'
                alignItems='center'
                gap={4}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqBaseTruncated || '0'}
                {baseTokenLogoComponent}
            </FlexContainer>

            <FlexContainer
                justifyContent='flex-end'
                alignItems='center'
                gap={4}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqQuoteTruncated || '0'}
                {quoteTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const apyDisplay = (
        <FlexContainer justifyContent='flex-end' data-label='apy'>
            {' '}
            <p className={apyClassname}>{apyString}</p>
        </FlexContainer>
    );

    const rangeDisplay = (
        <FlexContainer padding='0 0 0 8px' data-label='status'>
            <RangeStatus
                isInRange={isPositionInRange}
                isAmbient={isAmbient}
                isEmpty={position.positionLiq === 0}
                justSymbol
            />
        </FlexContainer>
    );

    return {
        valueWithTooltip,
        walletWithTooltip,
        tokenPair,
        IDWithTooltip,
        rankingOrNull,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        rangeTimeWithTooltip,
        txIdColumnComponent,
        fullScreenMinDisplay,
        fullScreenMaxDisplay,
        priceDisplay,
        tokenValues,
        apyDisplay,
        rangeDisplay,
    };
}

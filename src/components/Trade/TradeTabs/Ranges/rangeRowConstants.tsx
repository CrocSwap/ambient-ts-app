import moment from 'moment';
import { useContext } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { ZERO_ADDRESS } from '../../../../ambient-utils/constants';
import { PositionIF, TokenIF } from '../../../../ambient-utils/types';
import { maxWidth } from '../../../../ambient-utils/types/mediaQueries';
import { PoolContext } from '../../../../contexts/PoolContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import {
    linkGenMethodsIF,
    poolParamsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import Medal from '../../../Global/Medal/Medal';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';

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
    lowDisplayPriceInUsd: string;
    highDisplayPriceInUsd: string;
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
    isBaseTokenMoneynessGreaterOrEqual: boolean;
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
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
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
        isBaseTokenMoneynessGreaterOrEqual,
    } = props;

    const { isTradeDollarizationEnabled } = useContext(PoolContext);
    const { tokenA, setActiveTab } = useContext(TradeDataContext);
    const { handlePulseAnimation, setActiveMobileComponent } =
        useContext(TradeTableContext);
    const {
        setRangeTicksCopied,
        setSimpleRangeWidth,
        setAdvancedHighTick,
        setAdvancedLowTick,
        setAdvancedMode,
    } = useContext(RangeContext);

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const SMALL_SCREEN_BP: maxWidth = '(max-width: 720px)';
    const smallScreen = useMediaQuery(SMALL_SCREEN_BP);

    const IDWithTooltip = (
        <RowItem hover data-label='id' role='button' tabIndex={0}>
            <TextOnlyTooltip
                title={
                    <FlexContainer
                        justifyContent='center'
                        background='dark3'
                        color='text1'
                        padding='12px'
                        gap={8}
                        rounded
                        font='roboto'
                        role='button'
                        style={{ width: '480px', cursor: 'default' }}
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        {posHash.toString()}
                        <FiCopy
                            size={'12px'}
                            style={{ cursor: 'pointer' }}
                            onClick={handleCopyPosHash}
                        />
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
            >
                <Text font='roboto'>{posHashTruncated}</Text>
            </TextOnlyTooltip>
        </RowItem>
    );

    const hiddenIDColumn = (
        <RowItem
            hover
            data-label='hidden-id'
            role='button'
            style={{ display: 'none' }}
            tabIndex={0}
        >
            <span>{posHash.toString()}</span>
        </RowItem>
    );

    const valueWithTooltip = (
        <FlexContainer
            justifyContent='flex-end'
            alignItems='center'
            data-label='value'
            className='base_color'
        >
            {usdValue}
        </FlexContainer>
    );

    const actualWalletWithTooltip = (
        <RowItem
            data-label='wallet'
            style={ensName ? { textTransform: 'lowercase' } : undefined}
        >
            <TextOnlyTooltip
                title={
                    <FlexContainer
                        justifyContent='center'
                        background='dark3'
                        color='text1'
                        padding='12px'
                        gap={8}
                        rounded
                        font='roboto'
                        role='button'
                        style={{ width: '350px' }}
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <Text
                            font='roboto'
                            onClick={handleWalletLinkClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {ownerId}
                        </Text>
                        <FiCopy
                            size={'12px'}
                            onClick={() => handleWalletCopy()}
                        />

                        <FiExternalLink
                            size={'12px'}
                            onClick={handleWalletLinkClick}
                        />
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
            >
                <Text
                    font={usernameColor === 'text1' ? 'roboto' : undefined}
                    color={usernameColor}
                >
                    {userNameToDisplay}
                </Text>
            </TextOnlyTooltip>
        </RowItem>
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

    // URL params for link to pool page
    const poolLinkParams: poolParamsIF = {
        chain: position.chainId,
        tokenA:
            tokenA.address.toLowerCase() === position.quote.toLowerCase()
                ? position.quote
                : position.base,
        tokenB:
            tokenA.address.toLowerCase() === position.quote.toLowerCase()
                ? position.base
                : position.quote,
        lowTick: position.bidTick.toString(),
        highTick: position.askTick.toString(),
    };

    const handleCopyClick = () => {
        setActiveTab('Order');
        setActiveMobileComponent('trade');

        setRangeTicksCopied(true);
        handlePulseAnimation('range');

        if (position.positionType === 'ambient') {
            setSimpleRangeWidth(100);
            setAdvancedMode(false);
        } else {
            setAdvancedLowTick(position.bidTick);
            setAdvancedHighTick(position.askTick);
            setAdvancedMode(true);
        }
    };

    const tokenPair = (
        <div
            className='base_color'
            onClick={(event) => {
                event.stopPropagation();
                handleCopyClick();
            }}
        >
            {isOwnerActiveAccount ? (
                <RowItem hover>
                    <Link to={linkGenPool.getFullURL(poolLinkParams)}>
                        <span style={{ textTransform: 'none' }}>
                            {isBaseTokenMoneynessGreaterOrEqual
                                ? `${quoteTokenSymbol} / ${baseTokenSymbol}`
                                : `${baseTokenSymbol} / ${quoteTokenSymbol}`}
                        </span>
                        <FiExternalLink
                            size={10}
                            color='white'
                            style={{ marginLeft: '.5rem' }}
                        />
                    </Link>
                </RowItem>
            ) : (
                <RowItem hover>
                    <a
                        href={linkGenPool.getFullURL(poolLinkParams)}
                        target='_blank'
                        rel='noreferrer'
                    >
                        <div>
                            <span style={{ textTransform: 'none' }}>
                                {isBaseTokenMoneynessGreaterOrEqual
                                    ? `${quoteTokenSymbol} / ${baseTokenSymbol}`
                                    : `${baseTokenSymbol} / ${quoteTokenSymbol}`}
                            </span>
                            <FiExternalLink
                                size={10}
                                color='white'
                                style={{ marginLeft: '.5rem' }}
                            />
                        </div>
                    </a>
                </RowItem>
            )}
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
        <RowItem gap={4}>
            <>
                {position.latestUpdateTime ? (
                    <TextOnlyTooltip
                        title={
                            <FlexContainer
                                fullWidth
                                justifyContent='center'
                                background='dark3'
                                color='text1'
                                padding='12px'
                                gap={8}
                                rounded
                                role='button'
                                onClick={(
                                    event: React.MouseEvent<HTMLDivElement>,
                                ) => event.stopPropagation()}
                            >
                                {moment(
                                    position.latestUpdateTime * 1000,
                                ).format('MM/DD/YYYY HH:mm')}
                            </FlexContainer>
                        }
                        placement={'right'}
                        enterDelay={750}
                    >
                        <div style={{ textTransform: 'lowercase' }}>
                            <Text
                                style={{ textTransform: 'lowercase' }}
                                tabIndex={0}
                            >
                                {elapsedTimeString}
                            </Text>
                        </div>
                    </TextOnlyTooltip>
                ) : (
                    <div style={{ textTransform: 'lowercase' }}>
                        <p className='base_color'>{elapsedTimeString}</p>
                    </div>
                )}
            </>
        </RowItem>
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
            <span>{!isTradeDollarizationEnabled && sideCharacter}</span>
            <span>
                {isAccountView && !isAmbient
                    ? isTradeDollarizationEnabled
                        ? lowDisplayPriceInUsd
                        : minRangeDenomByMoneyness || '…'
                    : isTradeDollarizationEnabled
                      ? lowDisplayPriceInUsd
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
            <span>{!isTradeDollarizationEnabled && sideCharacter}</span>
            <span>
                {isAccountView
                    ? isTradeDollarizationEnabled
                        ? highDisplayPriceInUsd
                        : maxRangeDenomByMoneyness || '…'
                    : isTradeDollarizationEnabled
                      ? highDisplayPriceInUsd
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
                <span>{!isTradeDollarizationEnabled && sideCharacter}</span>
                <span>
                    {isAccountView && !isAmbient
                        ? isTradeDollarizationEnabled
                            ? lowDisplayPriceInUsd
                            : minRangeDenomByMoneyness || '…'
                        : isTradeDollarizationEnabled
                          ? lowDisplayPriceInUsd
                          : ambientOrMin || '…'}
                </span>
            </p>
            <p>
                <span>{!isTradeDollarizationEnabled && sideCharacter}</span>
                <span>
                    {isAccountView
                        ? isTradeDollarizationEnabled
                            ? highDisplayPriceInUsd
                            : maxRangeDenomByMoneyness || '…'
                        : isTradeDollarizationEnabled
                          ? highDisplayPriceInUsd
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
        <FlexContainer
            justifyContent='flex-end'
            data-label='apy'
            style={{ paddingRight: '10px' }}
        >
            <p className={apyClassname}>{apyString}</p>
        </FlexContainer>
    );

    const rangeDisplay = (
        <FlexContainer padding='0 0 0 18px' data-label='status'>
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
        hiddenIDColumn,
    };
}

import moment from 'moment';
import { useContext } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../ambient-utils/types';
import { maxWidth } from '../../../../ambient-utils/types/mediaQueries';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import {
    limitParamsIF,
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';

interface propsIF {
    posHashTruncated: string;
    posHash: string;
    usdValue: string;
    usernameColor: 'accent1' | 'accent2' | 'text1';
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
    sideType: 'sell' | 'buy';
    sideCharacter: string;
    limitOrder: LimitOrderIF;
    priceCharacter: string;
    displayPriceInUsd: string | undefined;
    truncatedDisplayPriceDenomByMoneyness: string | undefined;
    truncatedDisplayPrice: string | undefined;
    isOwnerActiveAccount: boolean;
    isAccountView: boolean;
    ensName: string | null;
    isOrderFilled: boolean;
    isLimitOrderPartiallyFilled: boolean;
    fillPercentage: number;
    handleCopyPosHash: () => void;
    handleWalletLinkClick: () => void;
    handleWalletCopy: () => void;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
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
        usdValue,
        usernameColor,
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
        truncatedDisplayPrice,
        displayPriceInUsd,
        truncatedDisplayPriceDenomByMoneyness,
        sideType,
        sideCharacter,
        isOrderFilled,
        baseTokenAddress,
        quoteTokenAddress,
        isLimitOrderPartiallyFilled,
        originalPositionLiqBase,
        originalPositionLiqQuote,
        expectedPositionLiqBase,
        expectedPositionLiqQuote,
        fillPercentage,
        isBaseTokenMoneynessGreaterOrEqual,
    } = props;

    const { tokens } = useContext(TokenContext);
    const { isTradeDollarizationEnabled } = useContext(PoolContext);
    const { tokenA, setIsTokenAPrimary } = useContext(TradeDataContext);
    const baseToken: TokenIF | undefined =
        tokens.getTokenByAddress(baseTokenAddress);
    const quoteToken: TokenIF | undefined =
        tokens.getTokenByAddress(quoteTokenAddress);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const SMALL_SCREEN_BP: maxWidth = '(max-width: 720px)';
    const smallScreen = useMediaQuery(SMALL_SCREEN_BP);

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const IDWithTooltip = (
        <RowItem hover data-label='id' role='button' tabIndex={0}>
            <TextOnlyTooltip
                interactive
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
                        style={{ width: '440px', cursor: 'default' }}
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        {posHash}
                        <FiCopy
                            size={'12px'}
                            style={{ cursor: 'pointer' }}
                            onClick={handleCopyPosHash}
                        />
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
                leaveDelay={0}
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
            <span>{posHash}</span>
        </RowItem>
    );

    const ValueWithTooltip = (
        <RowItem
            justifyContent='flex-end'
            type={sideType}
            data-label='value'
            tabIndex={0}
        >
            {' '}
            {usdValue}
        </RowItem>
    );

    const actualWalletWithTooltip = (
        <RowItem
            data-label='wallet'
            style={ensName ? { textTransform: 'lowercase' } : undefined}
        >
            <TextOnlyTooltip
                interactive
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
                        style={{ width: '316px' }}
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <Text
                            font='roboto'
                            onClick={handleWalletLinkClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {limitOrder.user}
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
                leaveDelay={0}
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

    const newTokenA: string = limitOrder.isBid
        ? limitOrder.base
        : limitOrder.quote;
    const newTokenB: string = limitOrder.isBid
        ? limitOrder.quote
        : limitOrder.base;

    // URL params for link to limit page
    const limitLinkParams: limitParamsIF = {
        chain: limitOrder.chainId,
        tokenA: newTokenA,
        tokenB: newTokenB,
        limitTick: limitOrder.isBid ? limitOrder.bidTick : limitOrder.askTick,
    };

    const tokenPair = (
        <div
            className='base_color'
            onClick={(event) => event.stopPropagation()}
        >
            {isOwnerActiveAccount ? (
                <RowItem hover>
                    <Link
                        to={linkGenLimit.getFullURL(limitLinkParams)}
                        onClick={() => {
                            tokenA.address.toLowerCase() !==
                                newTokenA.toLowerCase() &&
                                setIsTokenAPrimary((isTokenAPrimary) => {
                                    return !isTokenAPrimary;
                                });
                        }}
                    >
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
                        href={linkGenLimit.getFullURL(limitLinkParams)}
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

    const baseQtyDisplayWithTooltip = (
        <div data-label={baseTokenSymbol} className='base_color' tabIndex={0}>
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                {limitOrder.isBid
                    ? originalPositionLiqBase
                    : expectedPositionLiqBase}
                {baseTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const quoteQtyDisplayWithTooltip = (
        <div data-label={quoteTokenSymbol} className='base_color' tabIndex={0}>
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                {limitOrder.isBid
                    ? expectedPositionLiqQuote
                    : originalPositionLiqQuote}
                {quoteTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const OrderTimeWithTooltip = (
        <RowItem gap={4}>
            <>
                {limitOrder.latestUpdateTime ? (
                    <TextOnlyTooltip
                        interactive
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
                                    limitOrder.latestUpdateTime * 1000,
                                ).format('MM/DD/YYYY HH:mm')}
                            </FlexContainer>
                        }
                        placement={'right'}
                        enterDelay={750}
                        leaveDelay={0}
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

    const priceDisplay = (
        <RowItem
            flexDirection='column'
            alignItems='flex-end'
            justifyContent='center'
            type={sideType}
            data-label='price'
        >
            <p>
                <span>
                    {isAccountView
                        ? isTradeDollarizationEnabled
                            ? displayPriceInUsd
                            : truncatedDisplayPriceDenomByMoneyness
                        : isTradeDollarizationEnabled
                          ? displayPriceInUsd
                          : truncatedDisplayPrice}
                </span>
            </p>
        </RowItem>
    );

    const typeDisplay = (
        <RowItem justifyContent='center' type={sideType} data-label='type'>
            Limit
        </RowItem>
    );

    const sideDisplay = (
        <RowItem type={sideType} justifyContent='center' data-label='side'>
            {`${sideType} ${sideCharacter}`}
        </RowItem>
    );

    const sideTypeColumn = (
        <RowItem
            flexDirection='column'
            type={sideType}
            data-label='side-type'
            style={{ textAlign: 'center' }}
        >
            <p>Limit</p>
            <p>{`${sideType} ${sideCharacter}`}</p>
        </RowItem>
    );

    const tokensColumn = (
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
                {limitOrder.isBid
                    ? originalPositionLiqBase
                    : expectedPositionLiqBase}
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
                {' '}
                {limitOrder.isBid
                    ? expectedPositionLiqQuote
                    : originalPositionLiqQuote}
                {quoteTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const statusDisplay = (
        <div data-label='status'>
            <FlexContainer justifyContent='center' alignItems='center'>
                <OpenOrderStatus
                    isFilled={isOrderFilled}
                    isLimitOrderPartiallyFilled={isLimitOrderPartiallyFilled}
                    fillPercentage={fillPercentage}
                />
            </FlexContainer>
        </div>
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
        hiddenIDColumn,
    };
};

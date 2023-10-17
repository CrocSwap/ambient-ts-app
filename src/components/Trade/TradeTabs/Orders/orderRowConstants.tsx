import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import moment from 'moment';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import {
    limitParamsIF,
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { FlexContainer, Text } from '../../../../styled/Common';

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
        priceCharacter,
        truncatedDisplayPrice,
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

    // URL params for link to limit page
    const limitLinkParams: limitParamsIF = {
        chain: limitOrder.chainId,
        tokenA: limitOrder.quote,
        tokenB: limitOrder.base,
        limitTick: limitOrder.isBid ? limitOrder.askTick : limitOrder.bidTick,
    };

    const tokenPair = (
        <div
            className='base_color'
            data-label='tokens'
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink to={linkGenLimit.getFullURL(limitLinkParams)}>
                {baseTokenSymbol} / {quoteTokenSymbol}
            </NavLink>
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
            {(
                <p>
                    <span>{priceCharacter}</span>
                    <span>
                        {isAccountView
                            ? truncatedDisplayPriceDenomByMoneyness
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
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
    };
};

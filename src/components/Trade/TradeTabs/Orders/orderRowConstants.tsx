import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
import { LimitOrderIF, TokenIF } from '../../../../utils/interfaces/exports';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import moment from 'moment';
import OpenOrderStatus from '../../../Global/OpenOrderStatus/OpenOrderStatus';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../styled/Common';

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

    const tradeLinkPath =
        '/trade/limit/' +
        formSlugForPairParams(
            limitOrder.chainId,
            limitOrder.quote,
            limitOrder.base,
        );

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
                    {posHash}
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
                        <span onClick={handleWalletLinkClick}>
                            {limitOrder.user}
                        </span>
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
                data-label='wallet'
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

    const tokenPair = (
        <div
            className='base_color'
            data-label='tokens'
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink to={tradeLinkPath}>
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

    const OrderTimeWithTooltip = limitOrder.timeFirstMint ? (
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
                    {moment(limitOrder.latestUpdateTime * 1000).format(
                        'MM/DD/YYYY HH:mm',
                    )}
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <div style={{ textTransform: 'lowercase' }}>
                <p className='base_color'>{elapsedTimeString}</p>
            </div>
        </TextOnlyTooltip>
    ) : (
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

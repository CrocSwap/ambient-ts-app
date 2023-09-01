import { FiCopy, FiExternalLink } from 'react-icons/fi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
import { TokenIF, TransactionIF } from '../../../../utils/interfaces/exports';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { IS_LOCAL_ENV } from '../../../../constants';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import React, { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import { FlexContainer } from '../../../../styled/Common';
import { TransactionItem } from '../../../../styled/Components/TransactionTable';

interface propsIF {
    txHashTruncated: string;
    usdValue: string;
    usernameColor: 'accent1' | 'accent2' | 'text1';
    userNameToDisplay: string;
    baseTokenLogo: string;
    baseQuantityDisplay: string;
    quoteTokenLogo: string;
    quoteQuantityDisplay: string;
    elapsedTimeString: string;
    sideType: 'add' | 'claim' | 'harvest' | 'remove' | 'buy' | 'sell';
    sideCharacter: string;
    ensName: string | null;
    ownerId: string;
    positiveArrow: string;
    positiveDisplayColor: 'text1' | 'positive';
    negativeDisplayColor: 'text1' | 'negative';
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
    isAccountView: boolean;
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
export const txRowConstants = (props: propsIF) => {
    const {
        handleCopyTxHash,
        handleOpenExplorer,
        txHashTruncated,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        usdValue,
        ensName,
        usernameColor,
        userNameToDisplay,
        baseTokenLogo,
        quoteTokenLogo,
        isAccountView,
        tx,
        elapsedTimeString,
        baseQuantityDisplay,
        quoteQuantityDisplay,
        isOwnerActiveAccount,
        ownerId,
        sideType,
        sideCharacter,
        isBuy,
        isOrderRemove,
        valueArrows,
        positiveArrow,
        positiveDisplayColor,
        negativeDisplayColor,
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

    const { tokens } = useContext(TokenContext);
    const baseToken: TokenIF | undefined = tokens.getTokenByAddress(tx.base);
    const quoteToken: TokenIF | undefined = tokens.getTokenByAddress(tx.quote);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    onClick={(event) => event.stopPropagation()}
                    style={{
                        marginLeft: '-60px',
                        background: 'var(--dark3)',
                        color: 'var(--text1)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontFamily: 'var(--roboto)',
                        whiteSpace: 'nowrap',
                        width: '421px',
                    }}
                >
                    <span onClick={handleOpenExplorer}>
                        {' '}
                        {tx.txHash + 'ㅤ'}
                    </span>
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
            <TransactionItem
                hover
                font='mono'
                data-label='id'
                role='button'
                tabIndex={0}
            >
                {txHashTruncated}
            </TransactionItem>
        </TextOnlyTooltip>
    );

    const usdValueWithTooltip = (
        <TransactionItem
            justifyContent='flex-end'
            type={sideType}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='value'
            tabIndex={0}
        >
            {usdValue}
        </TransactionItem>
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
                    <TransactionItem
                        font='mono'
                        gap={4}
                        role='button'
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <span onClick={handleWalletClick}>{ownerId}</span>
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
                    </TransactionItem>
                </div>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <TransactionItem
                color={usernameColor}
                font={usernameColor === 'text1' ? 'roboto' : undefined}
                data-label='wallet'
                style={ensName ? { textTransform: 'lowercase' } : undefined}
            >
                {userNameToDisplay}
            </TransactionItem>
        </TextOnlyTooltip>
    );

    const walletWithoutTooltip = (
        <TransactionItem
            hover
            color={usernameColor}
            font={usernameColor === 'text1' ? 'roboto' : undefined}
            data-label='wallet'
            style={{ textTransform: 'lowercase' }}
            tabIndex={0}
        >
            {userNameToDisplay}
        </TransactionItem>
    );

    const walletWithTooltip = isOwnerActiveAccount
        ? walletWithoutTooltip
        : actualWalletWithTooltip;

    const baseTokenLogoComponent = (
        <DefaultTooltip
            interactive
            title={
                <p>
                    {tx.baseSymbol}
                    {`${tx.baseSymbol === 'ETH' ? '' : ': ' + tx.base}`}
                </p>
            }
            placement={'left'}
            disableHoverListener={!isAccountView}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <TokenIcon
                token={baseToken}
                src={baseTokenLogo}
                alt={tx.baseSymbol}
                size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
            />
        </DefaultTooltip>
    );

    const quoteTokenLogoComponent = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    {tx.quoteSymbol}: {tx.quote}
                </div>
            }
            placement={'left'}
            disableHoverListener={!isAccountView}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <TokenIcon
                token={quoteToken}
                src={quoteTokenLogo}
                alt={tx.quoteSymbol}
                size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
            />
        </DefaultTooltip>
    );

    const tradeLinkPath =
        (tx.entityType.toLowerCase() === 'limitorder'
            ? '/trade/limit/'
            : tx.entityType.toLowerCase() === 'liqchange'
            ? '/trade/pool/'
            : '/trade/market/') +
        formSlugForPairParams(tx.chainId, tx.quote, tx.base);

    const tokenPair = (
        <div
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={(event) => event.stopPropagation()}
        >
            <NavLink to={tradeLinkPath}>
                {tx.baseSymbol} / {tx.quoteSymbol}
            </NavLink>
        </div>
    );

    const TxTimeWithTooltip = (
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
                    {moment(tx.txTime * 1000).format('MM/DD/YYYY HH:mm')}
                </p>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <div
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
                tabIndex={0}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </div>
        </TextOnlyTooltip>
    );

    const baseQtyDisplayWithTooltip = (
        <div
            data-label={tx.baseSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            tabIndex={0}
        >
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                {baseQuantityDisplay}
                {baseTokenLogoComponent}
            </FlexContainer>
        </div>
    );
    const quoteQtyDisplayWithTooltip = (
        <div
            data-label={tx.quoteSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            tabIndex={0}
        >
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                {quoteQuantityDisplay}
                {quoteTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const txIdColumnComponent = (
        <div>
            {IDWithTooltip}
            {walletWithTooltip}
        </div>
    );

    const sideDisplay = (
        <TransactionItem
            type={sideType}
            justifyContent='center'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='side'
            tabIndex={0}
        >
            {tx.entityType === 'liqchange' ||
            tx.changeType === 'burn' ||
            tx.changeType === 'recover'
                ? `${sideType}`
                : `${sideType} ${sideCharacter}`}
        </TransactionItem>
    );

    const baseQuoteQtyDisplayColumn = (
        <div
            data-label={tx.baseSymbol + tx.quoteSymbol}
            className='color_white'
            style={{ textAlign: 'right' }}
            onClick={() => {
                openDetailsModal();
            }}
        >
            <FlexContainer
                justifyContent='flex-end'
                alignItems='center'
                gap={4}
                color={positiveDisplayColor}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {isBuy
                    ? isOrderRemove
                        ? baseQuantityDisplay
                        : quoteQuantityDisplay
                    : isOrderRemove
                    ? quoteQuantityDisplay
                    : baseQuantityDisplay}
                {valueArrows ? positiveArrow : ' '}
                {isBuy
                    ? isOrderRemove
                        ? baseTokenLogoComponent
                        : quoteTokenLogoComponent
                    : isOrderRemove
                    ? quoteTokenLogoComponent
                    : baseTokenLogoComponent}
            </FlexContainer>

            <FlexContainer
                justifyContent='flex-end'
                alignItems='center'
                gap={4}
                color={negativeDisplayColor}
                style={{
                    whiteSpace: 'nowrap',
                }}
            >
                {isBuy
                    ? `${
                          isOrderRemove
                              ? quoteQuantityDisplay
                              : baseQuantityDisplay
                      }${valueArrows ? negativeArrow : ' '}`
                    : `${
                          isOrderRemove
                              ? baseQuantityDisplay
                              : quoteQuantityDisplay
                      }${valueArrows ? negativeArrow : ' '}`}
                {isBuy
                    ? isOrderRemove
                        ? quoteTokenLogoComponent
                        : baseTokenLogoComponent
                    : isOrderRemove
                    ? baseTokenLogoComponent
                    : quoteTokenLogoComponent}
            </FlexContainer>
        </div>
    );

    const typeDisplay = (
        <TransactionItem
            justifyContent='center'
            type={sideType}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='type'
            tabIndex={0}
        >
            {type}
        </TransactionItem>
    );

    const typeAndSideColumn = (
        <TransactionItem
            flexDirection='column'
            type={sideType}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='side-type'
            style={{ textAlign: 'center' }}
        >
            <p>{type}</p>
            <p>
                {tx.entityType === 'liqchange' ||
                tx.changeType === 'burn' ||
                tx.changeType === 'recover'
                    ? `${sideType}`
                    : `${sideType} ${sideCharacter}`}
            </p>
        </TransactionItem>
    );

    const ambientPriceDisplay = (
        <div
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='price'
            className={'primary_color'}
            style={{
                textAlign: 'right',
                textTransform: 'lowercase',
            }}
            tabIndex={0}
        >
            ambient
        </div>
    );

    const lowAndHighPriceDisplay = (
        <TransactionItem
            flexDirection='column'
            alignItems='flex-end'
            justifyContent='center'
            type={sideType}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            data-label='price'
            tabIndex={0}
        >
            <p>
                <span>{truncatedLowDisplayPrice ? priceCharacter : '…'}</span>
                <span>
                    {isAccountView
                        ? truncatedLowDisplayPriceDenomByMoneyness
                        : truncatedLowDisplayPrice}
                </span>
            </p>
            <p>
                <span>{truncatedHighDisplayPrice ? priceCharacter : '…'}</span>
                <span>
                    {isAccountView
                        ? truncatedHighDisplayPriceDenomByMoneyness
                        : truncatedHighDisplayPrice}
                </span>
            </p>
        </TransactionItem>
    );

    const priceDisplay = (
        <TransactionItem
            justifyContent='flex-end'
            type={sideType}
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={() => {
                if (IS_LOCAL_ENV) {
                    console.debug({ isAccountView });
                    console.debug({
                        truncatedDisplayPriceDenomByMoneyness,
                    });
                }
                openDetailsModal();
            }}
            data-label='price'
            tabIndex={0}
        >
            {(
                <p>
                    <span>
                        {(
                            isAccountView
                                ? truncatedDisplayPriceDenomByMoneyness
                                : truncatedDisplayPrice
                        )
                            ? priceCharacter
                            : '…'}
                    </span>
                    <span>
                        {isAccountView
                            ? truncatedDisplayPriceDenomByMoneyness
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
        </TransactionItem>
    );

    return {
        IDWithTooltip,
        usdValueWithTooltip,
        walletWithTooltip,
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

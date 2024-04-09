import { FiCopy, FiExternalLink } from 'react-icons/fi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
import { TokenIF, TransactionIF } from '../../../../ambient-utils/types';
import moment from 'moment';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { formSlugForPairParams } from '../../../../App/functions/urlSlugs';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';
import React, { useContext } from 'react';
import { TokenContext } from '../../../../contexts/TokenContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { Link } from 'react-router-dom';
import { PoolContext } from '../../../../contexts/PoolContext';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';

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
    displayPriceNumInUsd: number | undefined;
    lowDisplayPriceInUsd: number | undefined;
    highDisplayPriceInUsd: number | undefined;
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
    handleWalletClick: () => void;
    handleWalletCopy: () => void;
    tx: TransactionIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
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
        displayPriceNumInUsd,
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
        priceCharacter,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        truncatedDisplayPrice,
        handleWalletClick,
        handleWalletCopy,
        isBaseTokenMoneynessGreaterOrEqual,
    } = props;
    const { tokens } = useContext(TokenContext);
    const { isTradeDollarizationEnabled } = useContext(PoolContext);
    const baseToken: TokenIF | undefined = tokens.getTokenByAddress(tx.base);
    const quoteToken: TokenIF | undefined = tokens.getTokenByAddress(tx.quote);

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

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
                        style={{ width: '440px', cursor: 'pointer' }}
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <span onClick={handleOpenExplorer}>{tx.txHash}</span>
                        <FiCopy size={'12px'} onClick={handleCopyTxHash} />{' '}
                        <FiExternalLink
                            size={'12px'}
                            onClick={handleOpenExplorer}
                        />
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
                leaveDelay={0}
            >
                <Text font='roboto'>{txHashTruncated}</Text>
            </TextOnlyTooltip>
        </RowItem>
    );

    const formattedUsdPrice = displayPriceNumInUsd
        ? getFormattedNumber({ value: displayPriceNumInUsd, prefix: '$' })
        : '...';

    const formattedLowUsdPrice = lowDisplayPriceInUsd
        ? getFormattedNumber({ value: lowDisplayPriceInUsd, prefix: '$' })
        : '...';

    const formattedHighUsdPrice = highDisplayPriceInUsd
        ? getFormattedNumber({ value: highDisplayPriceInUsd, prefix: '$' })
        : '...';

    const usdValueWithTooltip = (
        <RowItem
            justifyContent='flex-end'
            type={sideType}
            data-label='value'
            tabIndex={0}
        >
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
                            onClick={handleWalletClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {ownerId}
                        </Text>
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
        formSlugForPairParams({
            chain: tx.chainId,
            tokenA: tx.quote,
            tokenB: tx.base,
        });

    const tokenPair = (
        <div
            className='base_color'
            onClick={(event) => event.stopPropagation()}
        >
            {isOwnerActiveAccount ? (
                <RowItem hover>
                    <Link to={tradeLinkPath}>
                        <span style={{ textTransform: 'none' }}>
                            {isBaseTokenMoneynessGreaterOrEqual
                                ? `${tx.quoteSymbol} / ${tx.baseSymbol}`
                                : `${tx.baseSymbol} / ${tx.quoteSymbol}`}
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
                    <a href={tradeLinkPath} target='_blank' rel='noreferrer'>
                        <div>
                            <span style={{ textTransform: 'none' }}>
                                {tx.baseSymbol} / {tx.quoteSymbol}
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

    const TxTimeWithTooltip = (
        <RowItem gap={4}>
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
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        {moment(tx.txTime * 1000).format('MM/DD/YYYY HH:mm')}
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
                leaveDelay={0}
            >
                <Text style={{ textTransform: 'lowercase' }} tabIndex={0}>
                    {elapsedTimeString}
                </Text>
            </TextOnlyTooltip>
        </RowItem>
    );

    const baseQtyDisplayWithTooltip = (
        <div data-label={tx.baseSymbol} className='base_color' tabIndex={0}>
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
        <div data-label={tx.quoteSymbol} className='base_color' tabIndex={0}>
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
        <RowItem
            type={sideType}
            justifyContent='center'
            data-label='side'
            tabIndex={0}
        >
            {tx.entityType === 'liqchange' ||
            tx.changeType === 'burn' ||
            tx.changeType === 'recover'
                ? `${sideType}`
                : `${sideType} ${sideCharacter}`}
        </RowItem>
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
        <RowItem
            justifyContent='center'
            type={sideType}
            data-label='type'
            tabIndex={0}
        >
            {type}
        </RowItem>
    );

    const typeAndSideColumn = (
        <RowItem
            flexDirection='column'
            type={sideType}
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
        </RowItem>
    );

    const ambientPriceDisplay = (
        <div
            data-label='price'
            className='primary_color'
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
        <RowItem
            flexDirection='column'
            alignItems='flex-end'
            justifyContent='center'
            type={sideType}
            data-label='price'
            tabIndex={0}
        >
            <p>
                <span>
                    {truncatedLowDisplayPrice && !isTradeDollarizationEnabled
                        ? priceCharacter
                        : isTradeDollarizationEnabled
                        ? ''
                        : '…'}
                </span>
                <span>
                    {isAccountView
                        ? isTradeDollarizationEnabled
                            ? formattedLowUsdPrice
                            : truncatedLowDisplayPriceDenomByMoneyness
                        : isTradeDollarizationEnabled
                        ? formattedLowUsdPrice
                        : truncatedLowDisplayPrice}
                </span>
            </p>
            <p>
                <span>
                    {truncatedHighDisplayPrice && !isTradeDollarizationEnabled
                        ? priceCharacter
                        : isTradeDollarizationEnabled
                        ? ''
                        : '…'}
                </span>
                <span>
                    {isAccountView
                        ? isTradeDollarizationEnabled
                            ? formattedHighUsdPrice
                            : truncatedHighDisplayPriceDenomByMoneyness
                        : isTradeDollarizationEnabled
                        ? formattedHighUsdPrice
                        : truncatedHighDisplayPrice}
                </span>
            </p>
        </RowItem>
    );

    const priceDisplay = (
        <RowItem
            justifyContent='flex-end'
            type={sideType}
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
                                ? !isTradeDollarizationEnabled &&
                                  truncatedDisplayPriceDenomByMoneyness
                                : !isTradeDollarizationEnabled &&
                                  truncatedDisplayPrice
                        )
                            ? priceCharacter
                            : isTradeDollarizationEnabled
                            ? ''
                            : '…'}
                    </span>
                    <span>
                        {isAccountView
                            ? isTradeDollarizationEnabled
                                ? formattedUsdPrice
                                : truncatedDisplayPriceDenomByMoneyness
                            : isTradeDollarizationEnabled
                            ? formattedUsdPrice
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
        </RowItem>
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

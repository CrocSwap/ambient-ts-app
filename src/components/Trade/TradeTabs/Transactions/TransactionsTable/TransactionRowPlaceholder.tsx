import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import {
    getFormattedNumber,
    getPinnedPriceValuesFromTicks,
    getUnicodeCharacter,
    trimString,
} from '../../../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../../../contexts';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { FlexContainer } from '../../../../../styled/Common';
import {
    RowItem,
    TransactionRow,
} from '../../../../../styled/Components/TransactionTable';
import { Chip } from '../../../../Form/Chip';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        action?: string;
        type: string;
        details?: {
            baseSymbol?: string;
            quoteSymbol?: string;
            baseTokenDecimals?: number;
            quoteTokenDecimals?: number;
            isAmbient?: boolean;
            lowTick?: number;
            highTick?: number;
            isBid?: boolean;
            gridSize?: number;
        };
    };
    tableView: 'small' | 'medium' | 'large';
}

// TODO: integrate into TransactionRow
export const TransactionRowPlaceholder = (props: PropsIF) => {
    const { transaction, tableView } = props;

    const { showAllData } = useContext(TradeTableContext);

    const { isDenomBase } = useContext(TradeDataContext);

    const {
        activeNetwork: { blockExplorer },
    } = useContext(AppStateContext);

    const baseTokenCharacter = transaction?.details?.baseSymbol
        ? getUnicodeCharacter(transaction.details.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction?.details?.quoteSymbol
        ? getUnicodeCharacter(transaction.details.quoteSymbol)
        : '';

    const sideCharacter = isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const priceCharacter = !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const id = (
        <RowItem font='roboto'>
            {trimString(transaction.hash, 9, 0, '…')}
        </RowItem>
    );
    const wallet = (
        <RowItem style={{ textTransform: 'lowercase' }}>
            <p>you</p>
        </RowItem>
    );

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        transaction?.details?.baseTokenDecimals ?? 0,
        transaction?.details?.quoteTokenDecimals ?? 0,
        transaction?.details?.lowTick ?? 0,
        transaction?.details?.highTick ?? 0,
        transaction?.details?.gridSize ?? 0,
    );
    const limitPrice =
        transaction.details &&
        transaction.details.lowTick &&
        transaction.details.highTick
            ? transaction.side === 'Buy'
                ? tickToPrice(transaction.details.lowTick)
                : tickToPrice(transaction.details.highTick)
            : 0;

    const limitPriceDecimalCorrected = toDisplayPrice(
        limitPrice,
        transaction.details?.baseTokenDecimals ?? 18,
        transaction.details?.quoteTokenDecimals ?? 18,
    );

    const invLimitPriceDecimalCorrected = 1 / limitPriceDecimalCorrected;

    const limitPriceDecimalCorrectedTruncated = getFormattedNumber({
        value: limitPriceDecimalCorrected,
    });

    const invLimitPriceDecimalCorrectedTruncated = getFormattedNumber({
        value: invLimitPriceDecimalCorrected,
    });

    // TODO: use media queries and standardized styles
    return (
        <>
            <TransactionRow
                size={tableView}
                user={showAllData}
                placeholder
                tabIndex={0}
                cursor='default'
            >
                {tableView !== 'small' && (
                    <div>
                        <p>Now</p>
                    </div>
                )}
                {tableView === 'large' && <div>{id}</div>}
                <div>{wallet}</div>
                {tableView !== 'small' ? (
                    transaction.type === 'Range' ? (
                        <FlexContainer
                            flexDirection='column'
                            alignItems='flex-end'
                            justifyContent='center'
                        >
                            <p>
                                {transaction.details?.isAmbient
                                    ? '0.00'
                                    : `${priceCharacter}${
                                          pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                          '...'
                                      }`}
                            </p>
                            <p>
                                {transaction.details?.isAmbient
                                    ? '∞'
                                    : `${priceCharacter}${
                                          pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                          '...'
                                      }`}
                            </p>
                        </FlexContainer>
                    ) : transaction.type === 'Limit' ? (
                        <FlexContainer justifyContent='flex-end'>
                            {isDenomBase
                                ? `${priceCharacter}${invLimitPriceDecimalCorrectedTruncated}`
                                : `${priceCharacter}${limitPriceDecimalCorrectedTruncated}`}
                        </FlexContainer>
                    ) : (
                        <FlexContainer justifyContent='flex-end'>
                            ...
                        </FlexContainer>
                    )
                ) : undefined}
                {tableView === 'large' && (
                    <FlexContainer justifyContent='center'>
                        {transaction.type === 'Market' ||
                        transaction.type === 'Limit'
                            ? transaction.side === 'Claim'
                                ? 'Claim'
                                : transaction.side === 'Remove'
                                  ? 'Remove'
                                  : (!isDenomBase &&
                                          transaction.details?.isBid ===
                                              true) ||
                                      (isDenomBase &&
                                          transaction.details?.isBid === false)
                                    ? 'Buy' + ` ${sideCharacter}`
                                    : 'Sell' + ` ${sideCharacter}`
                            : (transaction.side ?? '...')}
                    </FlexContainer>
                )}
                {tableView === 'large' && (
                    <FlexContainer justifyContent='center'>
                        {transaction.type}
                    </FlexContainer>
                )}
                {tableView !== 'large' && (
                    <FlexContainer
                        flexDirection='column'
                        alignItems='center'
                        justifyContent='center'
                        padding='6px 0'
                    >
                        <p>{transaction.type}</p>
                        <p>
                            {transaction.type === 'Market' ||
                            transaction.type === 'Limit'
                                ? transaction.side === 'Claim'
                                    ? 'Claim'
                                    : transaction.side === 'Remove'
                                      ? 'Remove'
                                      : (!isDenomBase &&
                                              transaction.details?.isBid ===
                                                  true) ||
                                          (isDenomBase &&
                                              transaction.details?.isBid ===
                                                  false)
                                        ? 'Buy' + ` ${sideCharacter}`
                                        : 'Sell' + ` ${sideCharacter}`
                                : (transaction.side ?? '...')}
                        </p>
                    </FlexContainer>
                )}
                {<FlexContainer justifyContent='flex-end'>...</FlexContainer>}
                {tableView !== 'small' && (
                    <FlexContainer justifyContent='flex-end'>...</FlexContainer>
                )}
                {tableView === 'large' && (
                    <FlexContainer justifyContent='flex-end'>...</FlexContainer>
                )}
                <FlexContainer justifyContent='flex-end' data-label='menu'>
                    <FlexContainer fullWidth justifyContent='flex-end'>
                        <Chip
                            ariaLabel='Explorer'
                            onClick={() =>
                                window.open(
                                    `${blockExplorer}tx/${transaction.hash}`,
                                )
                            }
                        >
                            Explorer
                            <FiExternalLink
                                size={15}
                                color='white'
                                style={{ marginLeft: '.5rem' }}
                            />
                        </Chip>
                    </FlexContainer>
                </FlexContainer>
            </TransactionRow>
        </>
    );
};

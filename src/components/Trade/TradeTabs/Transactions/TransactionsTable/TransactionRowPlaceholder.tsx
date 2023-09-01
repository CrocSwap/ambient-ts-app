import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import trimString from '../../../../../utils/functions/trimString';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import { FiExternalLink } from 'react-icons/fi';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { getPinnedPriceValuesFromTicks } from '../../../../../pages/Trade/Range/rangeFunctions';
import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import {
    TransactionItem,
    TransactionRow,
} from '../../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../../styled/Common';

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

    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

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
        <TransactionItem font='mono'>
            {trimString(transaction.hash, 9, 0, '…')}
        </TransactionItem>
    );
    const wallet = <p>you</p>;

    const pinnedDisplayPrices =
        transaction.details?.baseTokenDecimals &&
        transaction.details?.quoteTokenDecimals &&
        transaction.details?.lowTick &&
        transaction.details?.highTick &&
        transaction.details?.gridSize
            ? getPinnedPriceValuesFromTicks(
                  isDenomBase,
                  transaction.details.baseTokenDecimals,
                  transaction.details.quoteTokenDecimals,
                  transaction.details.lowTick,
                  transaction.details.highTick,
                  transaction.details.gridSize,
              )
            : undefined;

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
            >
                {tableView === 'large' && (
                    <div>
                        <p>Now</p>
                    </div>
                )}
                {tableView === 'large' && <div>{id}</div>}
                {tableView === 'large' && <div>{wallet}</div>}
                {tableView !== 'large' && (
                    <div>
                        {id}
                        {wallet}
                    </div>
                )}
                {tableView !== 'small' ? (
                    transaction.type === 'Range' ? (
                        <FlexContainer justifyContent='flex-end'>
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
                                      transaction.details?.isBid === true) ||
                                  (isDenomBase &&
                                      transaction.details?.isBid === false)
                                ? 'Buy' + ` ${sideCharacter}`
                                : 'Sell' + ` ${sideCharacter}`
                            : transaction.action ?? '...'}
                    </FlexContainer>
                )}
                {tableView === 'large' && (
                    <FlexContainer justifyContent='center'>
                        {transaction.type}
                    </FlexContainer>
                )}
                {tableView !== 'large' && (
                    <FlexContainer justifyContent='center' padding='6px 0'>
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
                                          transaction.details?.isBid === false)
                                    ? 'Buy' + ` ${sideCharacter}`
                                    : 'Sell' + ` ${sideCharacter}`
                                : transaction.action ?? '...'}
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
                        <OptionButton
                            ariaLabel='Explorer'
                            onClick={() =>
                                window.open(
                                    `${blockExplorer}tx/${transaction.hash}`,
                                )
                            }
                            content={
                                <>
                                    Explorer
                                    <FiExternalLink
                                        size={15}
                                        color='white'
                                        style={{ marginLeft: '.5rem' }}
                                    />
                                </>
                            }
                        />
                    </FlexContainer>
                </FlexContainer>
            </TransactionRow>
        </>
    );
};

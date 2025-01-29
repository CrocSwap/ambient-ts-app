import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import {
    getFormattedNumber,
    getUnicodeCharacter,
    trimString,
} from '../../../../../ambient-utils/dataLayer';
import { getPositionHash } from '../../../../../ambient-utils/dataLayer/functions/getPositionHash';
import { AppStateContext } from '../../../../../contexts';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../../styled/Common';
import {
    OrderRow,
    RowItem,
} from '../../../../../styled/Components/TransactionTable';
import { Chip } from '../../../../Form/Chip';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        type: string;
        baseSymbol: string;
        quoteSymbol: string;
        details?: {
            baseAddress?: string;
            quoteAddress?: string;
            poolIdx?: number;
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

// TODO: integrate into OrderRow
export const OrderRowPlaceholder = (props: PropsIF) => {
    const { transaction, tableView } = props;

    const { showAllData } = useContext(TradeTableContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        activeNetwork: { blockExplorer },
    } = useContext(AppStateContext);

    const { isDenomBase } = useContext(TradeDataContext);

    const baseTokenCharacter = transaction.baseSymbol
        ? getUnicodeCharacter(transaction.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction.quoteSymbol
        ? getUnicodeCharacter(transaction.quoteSymbol)
        : '';

    const sideCharacter = isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const priceCharacter = isDenomBase
        ? quoteTokenCharacter
        : baseTokenCharacter;

    const posHash = getPositionHash(undefined, {
        isPositionTypeAmbient: false,
        user: userAddress ?? '',
        baseAddress: transaction.details?.baseAddress ?? '',
        quoteAddress: transaction.details?.quoteAddress ?? '',
        poolIdx: transaction.details?.poolIdx ?? 0,
        bidTick: transaction.details?.lowTick ?? 0,
        askTick: transaction.details?.highTick ?? 0,
    });

    const limitPrice =
        transaction.details &&
        transaction.details.lowTick !== undefined &&
        transaction.details.highTick !== undefined
            ? transaction.details.isBid === true
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

    const id = (
        <RowItem font='roboto'>
            {trimString(posHash.toString(), 9, 0, '…')}
        </RowItem>
    );
    const wallet = (
        <RowItem style={{ textTransform: 'lowercase' }}>
            <p>you</p>
        </RowItem>
    );
    // TODO: use media queries and standardized styles
    return (
        <>
            <OrderRow
                size={tableView}
                user={showAllData}
                placeholder
                tabIndex={0}
                cursor='default'
            >
                {tableView === 'large' && (
                    <div>
                        <p>Now</p>
                    </div>
                )}
                {tableView === 'large' && <div>{id}</div>}
                <div>{wallet}</div>
                {tableView !== 'small' && (
                    <FlexContainer justifyContent='flex-end'>
                        {isDenomBase
                            ? `${priceCharacter}${invLimitPriceDecimalCorrectedTruncated}`
                            : `${priceCharacter}${limitPriceDecimalCorrectedTruncated}`}
                    </FlexContainer>
                )}
                {tableView === 'large' && (
                    <FlexContainer justifyContent='center'>
                        {transaction.side === 'Claim'
                            ? 'Claim'
                            : transaction.side === 'Remove'
                              ? 'Remove'
                              : (!isDenomBase &&
                                      transaction.details?.isBid === true) ||
                                  (isDenomBase &&
                                      transaction.details?.isBid === false)
                                ? 'Buy' + ` ${sideCharacter}`
                                : 'Sell' + ` ${sideCharacter}`}
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
                            {transaction.side === 'Claim'
                                ? 'Claim'
                                : transaction.side === 'Remove'
                                  ? 'Remove'
                                  : (!isDenomBase &&
                                          transaction.details?.isBid ===
                                              true) ||
                                      (isDenomBase &&
                                          transaction.details?.isBid === false)
                                    ? 'Buy' + ` ${sideCharacter}`
                                    : 'Sell' + ` ${sideCharacter}`}
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
                {tableView !== 'small' && (
                    <FlexContainer justifyContent='center'>
                        <OpenOrderStatus
                            isFilled={false}
                            isLimitOrderPartiallyFilled={false}
                            fillPercentage={0}
                        />
                    </FlexContainer>
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
            </OrderRow>
        </>
    );
};

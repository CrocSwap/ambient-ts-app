import { useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import {
    getPinnedPriceValuesFromTicks,
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
    RangeRow,
    RowItem,
} from '../../../../../styled/Components/TransactionTable';
import { Chip } from '../../../../Form/Chip';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';

interface PropsIF {
    transaction: {
        hash: string;
        side?: string;
        type: string;
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
            gridSize?: number;
        };
    };
    tableView: 'small' | 'medium' | 'large';
}

// TODO: integrate into RangesRow
export const RangesRowPlaceholder = (props: PropsIF) => {
    const { transaction, tableView } = props;

    const { showAllData } = useContext(TradeTableContext);
    const {
        activeNetwork: { blockExplorer },
    } = useContext(AppStateContext);

    const { isDenomBase } = useContext(TradeDataContext);

    const baseTokenCharacter = transaction?.details?.baseSymbol
        ? getUnicodeCharacter(transaction.details.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction?.details?.quoteSymbol
        ? getUnicodeCharacter(transaction.details.quoteSymbol)
        : '';

    const priceCharacter = !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
        isDenomBase,
        transaction?.details?.baseTokenDecimals ?? 0,
        transaction?.details?.quoteTokenDecimals ?? 0,
        transaction?.details?.lowTick ?? 0,
        transaction?.details?.highTick ?? 0,
        transaction?.details?.gridSize ?? 0,
    );
    const isAmbient =
        transaction.details?.isAmbient ||
        (transaction.details?.lowTick === 0 &&
            transaction.details?.highTick === 0);

    // -------------------------------POSITION HASH------------------------

    const { userAddress } = useContext(UserDataContext);

    const posHash = getPositionHash(undefined, {
        isPositionTypeAmbient: isAmbient,
        user: userAddress ?? '',
        baseAddress: transaction.details?.baseAddress ?? '',
        quoteAddress: transaction.details?.quoteAddress ?? '',
        poolIdx: transaction.details?.poolIdx ?? 0,
        bidTick: transaction.details?.lowTick ?? 0,
        askTick: transaction.details?.highTick ?? 0,
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
            <RangeRow
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
                {tableView === 'large' && (
                    <FlexContainer justifyContent='flex-end'>
                        {isAmbient
                            ? '0.00'
                            : `${priceCharacter}${
                                  pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                  '...'
                              }`}
                    </FlexContainer>
                )}
                {tableView === 'large' && (
                    <FlexContainer justifyContent='flex-end'>
                        {isAmbient
                            ? '∞'
                            : `${priceCharacter}${
                                  pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                  '...'
                              }`}
                    </FlexContainer>
                )}
                {tableView === 'medium' && (
                    <FlexContainer
                        flexDirection='column'
                        alignItems='flex-end'
                        justifyContent='center'
                    >
                        <p>
                            {isAmbient
                                ? '0.00'
                                : `${priceCharacter}${
                                      pinnedDisplayPrices?.pinnedMinPriceDisplayTruncatedWithCommas ??
                                      '...'
                                  }`}
                        </p>
                        <p>
                            {isAmbient
                                ? '∞'
                                : `${priceCharacter}${
                                      pinnedDisplayPrices?.pinnedMaxPriceDisplayTruncatedWithCommas ??
                                      '...'
                                  }`}
                        </p>
                    </FlexContainer>
                )}
                {<FlexContainer justifyContent='flex-end'>...</FlexContainer>}
                {<FlexContainer justifyContent='flex-end'>...</FlexContainer>}
                {tableView === 'large' ? (
                    <FlexContainer justifyContent='flex-end'>...</FlexContainer>
                ) : undefined}
                {tableView !== 'small' && (
                    <FlexContainer justifyContent='flex-end'>...</FlexContainer>
                )}
                {
                    <FlexContainer
                        justifyContent='flex-start'
                        padding='0 0 0 18px'
                    >
                        <RangeStatus
                            isInRange={false}
                            isAmbient={false}
                            isEmpty={true}
                            justSymbol
                        />
                    </FlexContainer>
                }
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
                            {' '}
                            Explorer
                            <FiExternalLink
                                size={15}
                                color='white'
                                style={{ marginLeft: '.5rem' }}
                            />
                        </Chip>
                    </FlexContainer>
                </FlexContainer>
            </RangeRow>
        </>
    );
};

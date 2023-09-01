import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import { FiExternalLink } from 'react-icons/fi';
import { getPinnedPriceValuesFromTicks } from '../../../../../pages/Trade/Range/rangeFunctions';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { ambientPosSlot, concPosSlot } from '@crocswap-libs/sdk';
import { useAccount } from 'wagmi';
import trimString from '../../../../../utils/functions/trimString';
import {
    RangeRow,
    RowItem,
} from '../../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../../styled/Common';

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
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    const baseTokenCharacter = transaction?.details?.baseSymbol
        ? getUnicodeCharacter(transaction.details.baseSymbol)
        : '';
    const quoteTokenCharacter = transaction?.details?.quoteSymbol
        ? getUnicodeCharacter(transaction.details.quoteSymbol)
        : '';

    const priceCharacter = !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

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

    const isAmbient =
        transaction.details?.isAmbient ||
        (transaction.details?.lowTick === 0 &&
            transaction.details?.highTick === 0);

    // -------------------------------POSITION HASH------------------------

    const { address: userAddress } = useAccount();

    let posHash;
    if (isAmbient) {
        posHash = ambientPosSlot(
            userAddress ?? '',
            transaction.details?.baseAddress ?? '',
            transaction.details?.quoteAddress ?? '',
            transaction.details?.poolIdx ?? 0,
        );
    } else {
        posHash = transaction.details
            ? concPosSlot(
                  userAddress ?? '',
                  transaction.details?.baseAddress ?? '',
                  transaction.details?.quoteAddress ?? '',
                  transaction.details?.lowTick ?? 0,
                  transaction.details?.highTick ?? 0,
                  transaction.details?.poolIdx ?? 0,
              ).toString()
            : '…';
    }

    const id = (
        <RowItem font='roboto'>
            {trimString(posHash.toString(), 9, 0, '…')}
        </RowItem>
    );
    const wallet = <p>you</p>;
    // TODO: use media queries and standardized styles
    return (
        <>
            <RangeRow
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
                    <FlexContainer justifyContent='flex-end'>
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
                {tableView === 'medium' && (
                    <FlexContainer justifyContent='flex-end'>...</FlexContainer>
                )}
                {
                    <FlexContainer justifyContent='flex-end'>
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
            </RangeRow>
        </>
    );
};

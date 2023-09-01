import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { OptionButton } from '../../../../Global/Button/OptionButton';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import { FiExternalLink } from 'react-icons/fi';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import trimString from '../../../../../utils/functions/trimString';
import { concPosSlot, tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
import { useAccount } from 'wagmi';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';
import {
    OrderRow,
    RowItem,
} from '../../../../../styled/Components/TransactionTable';
import { FlexContainer } from '../../../../../styled/Common';

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
    const { address: userAddress } = useAccount();
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const { isDenomBase } = useAppSelector((state) => state.tradeData);

    const wallet = <p>you</p>;

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

    const posHash = concPosSlot(
        userAddress ?? '',
        transaction.details?.baseAddress ?? '',
        transaction.details?.quoteAddress ?? '',
        transaction.details?.lowTick ?? 0,
        transaction.details?.highTick ?? 0,
        transaction.details?.poolIdx ?? 0,
    ).toString();

    const posHashTruncated = trimString(posHash ?? '', 9, 0, '…');

    const id = <RowItem font='mono'>{posHashTruncated}</RowItem>;

    const limitPrice =
        transaction.details &&
        transaction.details.lowTick &&
        transaction.details.highTick
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

    // TODO: use media queries and standardized styles
    return (
        <>
            <OrderRow
                size={tableView}
                user={showAllData}
                placeholder
                tabIndex={0}
            >
                {tableView === 'large' && (
                    <li>
                        <p>Now</p>
                    </li>
                )}
                {tableView === 'large' && <div>{id}</div>}
                {tableView === 'large' && <div>{wallet}</div>}
                {tableView !== 'large' && (
                    <div>
                        {id}
                        {wallet}
                    </div>
                )}
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
                    <FlexContainer justifyContent='center' padding='6px 0'>
                        <p>{transaction.type}</p>
                        <p>
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
            </OrderRow>
        </>
    );
};

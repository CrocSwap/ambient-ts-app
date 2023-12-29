import { useContext } from 'react';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { getFormattedNumber, getMoneynessRank, getUnicodeCharacter } from '../../../../ambient-utils/dataLayer';
import { TransactionIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { RowItem } from '../../../../styled/Components/TransactionTable';

interface propsIF {
    tx: TransactionIF;
    isAccountPage: boolean;
}

export default function TxPrice(props: propsIF) {
    const { tx, isAccountPage } = props;

    // whether denomination is displayed in terms of base token
    const { isDenomBase } = useContext(TradeDataContext);

    // needed for control flow below
    const isBaseTokenMoneynessGreaterOrEqual: boolean =
        getMoneynessRank(tx.baseSymbol) - getMoneynessRank(tx.quoteSymbol) >= 0;

    // needed for control flow below
    const isBuy: boolean = tx.isBuy === true || tx.isBid === true;

    // readable data for CSS control flow (color)
    const sideTypeReadable: 'add' | 'claim' | 'harvest' | 'remove' | 'buy' | 'sell' =
        tx.entityType === 'liqchange'
            ? tx.changeType === 'burn'
                ? 'remove'
                : tx.changeType === 'harvest'
                ? 'harvest'
                : 'add'
            : tx.entityType === 'limitOrder'
            ? tx.changeType === 'mint'
                ? isAccountPage
                    ? isBaseTokenMoneynessGreaterOrEqual
                        ? isBuy
                            ? 'buy'
                            : 'sell'
                        : isBuy
                        ? 'sell'
                        : 'buy'
                    : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
                    ? 'sell'
                    : 'buy'
                : tx.changeType === 'recover'
                ? 'claim'
                : 'remove'
            : isAccountPage
            ? isBaseTokenMoneynessGreaterOrEqual
                ? isBuy
                    ? 'buy'
                    : 'sell'
                : isBuy
                ? 'sell'
                : 'buy'
            : (isDenomBase && tx.isBuy) || (!isDenomBase && !tx.isBuy)
            ? 'sell'
            : 'buy';

    let truncatedDisplayPrice: string|undefined;
    let truncatedDisplayPriceDenomByMoneyness: string|undefined;

    if (tx.entityType === 'limitOrder') {
        if (tx.limitPriceDecimalCorrected && tx.invLimitPriceDecimalCorrected) {
            const priceDecimalCorrected = tx.limitPriceDecimalCorrected;
            const invPriceDecimalCorrected = tx.invLimitPriceDecimalCorrected;

            const nonInvertedPriceTruncated = getFormattedNumber({
                value: priceDecimalCorrected,
            });
            const invertedPriceTruncated = getFormattedNumber({
                value: invPriceDecimalCorrected,
            });
            truncatedDisplayPriceDenomByMoneyness =
                isBaseTokenMoneynessGreaterOrEqual
                    ? nonInvertedPriceTruncated
                    : invertedPriceTruncated;
            truncatedDisplayPrice = isDenomBase
                ? invertedPriceTruncated
                : nonInvertedPriceTruncated;
        }
    } else {
        const priceDecimalCorrected = tx.swapPriceDecimalCorrected;
        const invPriceDecimalCorrected = tx.swapInvPriceDecimalCorrected;

        const nonInvertedPriceTruncated = getFormattedNumber({
            value: priceDecimalCorrected,
        });
        const invertedPriceTruncated = getFormattedNumber({
            value: invPriceDecimalCorrected,
        });
        truncatedDisplayPriceDenomByMoneyness =
            isBaseTokenMoneynessGreaterOrEqual
                ? nonInvertedPriceTruncated
                : invertedPriceTruncated;

        truncatedDisplayPrice = isDenomBase
            ? invertedPriceTruncated
            : nonInvertedPriceTruncated;
    };

    const baseTokenCharacter = tx.baseSymbol
        ? getUnicodeCharacter(tx.baseSymbol)
        : '';
    const quoteTokenCharacter = tx.quoteSymbol
        ? getUnicodeCharacter(tx.quoteSymbol)
        : '';

    const priceCharacter = isAccountPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    // TODO: recreate `openDetailsModal()` functionality and re-enable

    return (
        <RowItem
            justifyContent='flex-end'
            type={sideTypeReadable}
            onClick={() => {
                if (IS_LOCAL_ENV) {
                    console.debug({ isAccountPage });
                    console.debug({
                        truncatedDisplayPriceDenomByMoneyness,
                    });
                }
                // openDetailsModal();
            }}
            data-label='price'
            tabIndex={0}
        >
            {(
                <p>
                    <span>
                        {(
                            isAccountPage
                                ? truncatedDisplayPriceDenomByMoneyness
                                : truncatedDisplayPrice
                        )
                            ? priceCharacter
                            : '…'}
                    </span>
                    <span>
                        {isAccountPage
                            ? truncatedDisplayPriceDenomByMoneyness
                            : truncatedDisplayPrice}
                    </span>
                </p>
            ) || '…'}
        </RowItem>
    );
}
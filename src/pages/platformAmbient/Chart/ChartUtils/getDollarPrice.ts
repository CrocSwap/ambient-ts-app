import { useCallback, useContext, useEffect, useState } from 'react';
import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { PoolContext } from '../../../../contexts/PoolContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';

interface DollarPrice {
    value: number;
    formattedValue: string;
}

const useDollarPrice = (): ((price: number) => DollarPrice) => {
    const { isDenomBase } = useContext(TradeDataContext);
    const { isTradeDollarizationEnabled, poolData } = useContext(PoolContext);

    const { basePrice, quotePrice } = poolData;

    const [cachedFunction, setCachedFunction] = useState<
        (price: number) => DollarPrice
    >(() => (price: number) => ({
        value: price,
        formattedValue: getFormattedNumber({
            value: price,
            zeroDisplay: '-',
            abbrevThreshold: 10000000,
        }),
    }));

    useEffect(() => {
        const getDollarPrice = (price: number): DollarPrice => {
            if (basePrice && quotePrice && isTradeDollarizationEnabled) {
                const dollarPrice = isDenomBase
                    ? price * quotePrice
                    : price * basePrice;
                return {
                    value: dollarPrice,
                    formattedValue: getFormattedNumber({
                        value: dollarPrice,
                        prefix: '$',
                    }),
                };
            }

            return {
                value: price,
                formattedValue: getFormattedNumber({
                    value: price,
                    zeroDisplay: '-',
                    abbrevThreshold: 10000000,
                }),
            };
        };

        setCachedFunction(() => getDollarPrice);
    }, [basePrice, quotePrice, isTradeDollarizationEnabled, isDenomBase]);

    const memoizedFunction = useCallback(cachedFunction, [cachedFunction]);

    if (!memoizedFunction) {
        return (price: number): DollarPrice => {
            return {
                value: price,
                formattedValue: getFormattedNumber({
                    value: price,
                    zeroDisplay: '-',
                    abbrevThreshold: 10000000,
                }),
            };
        };
    }

    return memoizedFunction;
};

export default useDollarPrice;

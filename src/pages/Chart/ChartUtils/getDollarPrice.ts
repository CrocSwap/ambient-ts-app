import { useCallback, useContext, useEffect, useState } from 'react';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolIF } from '../../../ambient-utils/types';
import useFetchPoolStats from '../../../App/hooks/useFetchPoolStats';
import { PoolContext } from '../../../contexts/PoolContext';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';

interface DollarPrice {
    value: number;
    formattedValue: string;
}

const useDollarPrice = (): ((price: number) => DollarPrice) => {
    const { baseToken, quoteToken, isDenomBase } = useContext(TradeDataContext);
    const { chainData } = useContext(CrocEnvContext);
    const { isTradeDollarizationEnabled } = useContext(PoolContext);

    const poolArg: PoolIF = {
        base: baseToken,
        quote: quoteToken,
        chainId: chainData.chainId,
        poolIdx: chainData.poolIndex,
    };

    const poolData = useFetchPoolStats(poolArg, true);
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

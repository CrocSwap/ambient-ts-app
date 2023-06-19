import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { tokenMethodsIF } from '../../../../../App/hooks/useTokens';
import { formatAmountOld } from '../../../../../utils/numbers';

export const getLimitPrice = (
    limitOrder: LimitOrderIF,
    tokens: tokenMethodsIF,
    isDenomBase: boolean,
): string => {
    const baseToken = tokens.getTokenByAddress(limitOrder.base);
    const quoteToken = tokens.getTokenByAddress(limitOrder.quote);

    const baseTokenCharacter = baseToken?.symbol
        ? getUnicodeCharacter(baseToken?.symbol)
        : '';
    const quoteTokenCharacter = quoteToken?.symbol
        ? getUnicodeCharacter(quoteToken?.symbol)
        : '';

    let output: string;

    if (isDenomBase) {
        const nonTruncatedPrice = limitOrder.invLimitPriceDecimalCorrected;
        const truncatedPrice =
            nonTruncatedPrice < 0.0001
                ? nonTruncatedPrice.toExponential(2)
                : nonTruncatedPrice < 2
                ? nonTruncatedPrice.toPrecision(3)
                : nonTruncatedPrice >= 10000
                ? formatAmountOld(nonTruncatedPrice, 1)
                : nonTruncatedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        output = quoteTokenCharacter + truncatedPrice;
    } else {
        const nonTruncatedPrice = limitOrder.limitPriceDecimalCorrected;
        const truncatedPrice =
            nonTruncatedPrice < 0.0001
                ? nonTruncatedPrice.toExponential(2)
                : nonTruncatedPrice < 2
                ? nonTruncatedPrice.toPrecision(3)
                : nonTruncatedPrice >= 10000
                ? formatAmountOld(nonTruncatedPrice, 1)
                : nonTruncatedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        output = baseTokenCharacter + truncatedPrice;
    }

    return output ?? '…';
};

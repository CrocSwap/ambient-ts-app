import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { tokenMethodsIF } from '../../../../../App/hooks/useNewTokens/useNewTokens';

export const getLimitPrice = (
    limitOrder: LimitOrderIF,
    tokens: tokenMethodsIF,
    isDenomBase: boolean,
): string => {
    const baseToken = tokens.getByAddress(limitOrder.base, limitOrder.chainId);
    const quoteToken = tokens.getByAddress(limitOrder.quote, limitOrder.chainId);;

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
            nonTruncatedPrice < 2
                ? nonTruncatedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : nonTruncatedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        output = quoteTokenCharacter + truncatedPrice;
    } else {
        const nonTruncatedPrice = limitOrder.limitPriceDecimalCorrected;
        const truncatedPrice =
            nonTruncatedPrice < 2
                ? nonTruncatedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                  })
                : nonTruncatedPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  });
        output = baseTokenCharacter + truncatedPrice;
    }

    return output ?? '…';
};

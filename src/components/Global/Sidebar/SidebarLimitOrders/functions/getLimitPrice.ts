import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';
import { tokenMethodsIF } from '../../../../../App/hooks/useTokens';
import { getFormattedNumber } from '../../../../../App/functions/getFormattedNumber';

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
        const truncatedPrice = getFormattedNumber({
            value: nonTruncatedPrice,
        });
        output = quoteTokenCharacter + truncatedPrice;
    } else {
        const nonTruncatedPrice = limitOrder.limitPriceDecimalCorrected;
        const truncatedPrice = getFormattedNumber({
            value: nonTruncatedPrice,
        });
        output = baseTokenCharacter + truncatedPrice;
    }

    return output ?? '…';
};

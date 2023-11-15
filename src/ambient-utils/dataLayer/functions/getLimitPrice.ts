import { LimitOrderIF, TokenMethodsIF } from '../../types';
import { getUnicodeCharacter } from './getUnicodeCharacter';
import { getFormattedNumber } from './getFormattedNumber';

export const getLimitPrice = (
    limitOrder: LimitOrderIF,
    tokens: TokenMethodsIF,
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

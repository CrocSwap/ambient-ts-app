import { LimitOrderIF, TokenMethodsIF } from '../../types';
import { getFormattedNumber } from './getFormattedNumber';
import { getUnicodeCharacter } from './getUnicodeCharacter';

export const getLimitPriceForSidebar = (
    limitOrder: LimitOrderIF,
    tokens: TokenMethodsIF,
    isDenomBase: boolean,
    isTradeDollarizationEnabled: boolean,
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

    if (isTradeDollarizationEnabled) {
        const nonTruncatedPrice = limitOrder.isBaseTokenMoneynessGreaterOrEqual
            ? limitOrder.baseUsdPrice
                ? limitOrder.limitPriceDecimalCorrected *
                  limitOrder.baseUsdPrice
                : undefined
            : limitOrder.quoteUsdPrice
              ? limitOrder.invLimitPriceDecimalCorrected *
                limitOrder.quoteUsdPrice
              : undefined;
        const truncatedPrice = getFormattedNumber({
            value: nonTruncatedPrice,
            prefix: '$',
        });
        output = truncatedPrice;
    } else {
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
    }

    return output ?? '…';
};

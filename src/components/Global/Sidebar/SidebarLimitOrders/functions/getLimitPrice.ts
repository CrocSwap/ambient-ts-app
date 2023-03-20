import { LimitOrderIF, TokenIF } from '../../../../../utils/interfaces/exports';
import getUnicodeCharacter from '../../../../../utils/functions/getUnicodeCharacter';

export const getLimitPrice = (
    limitOrder: LimitOrderIF,
    tokenMap: Map<string, TokenIF>,
    isDenomBase: boolean
): string => {
    const baseId = limitOrder.base + '_' + limitOrder.chainId;
    const quoteId = limitOrder.quote + '_' + limitOrder.chainId;
    const baseToken = tokenMap ? tokenMap.get(baseId.toLowerCase()) : null;
    const quoteToken = tokenMap ? tokenMap.get(quoteId.toLowerCase()) : null;

    const baseTokenCharacter = baseToken?.symbol ? getUnicodeCharacter(baseToken?.symbol) : '';
    const quoteTokenCharacter = quoteToken?.symbol ? getUnicodeCharacter(quoteToken?.symbol) : '';

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
        output = (quoteTokenCharacter + truncatedPrice);
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
        output = (baseTokenCharacter + truncatedPrice);
    }

    return output ?? '…';
}
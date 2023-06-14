import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { formatAmountOld } from '../../../../../utils/numbers';

// TODO: consolidate duplicate usd formatting
export const getLimitValue = (limitOrder: LimitOrderIF): string => {
    const usdValueNum = limitOrder.totalValueUSD;
    const usdValueTruncated = !usdValueNum
        ? undefined
        : usdValueNum < 0.0001
        ? usdValueNum.toExponential(2)
        : usdValueNum < 2
        ? usdValueNum.toPrecision(3)
        : usdValueNum >= 10000
        ? formatAmountOld(usdValueNum, 1)
        : usdValueNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
    return usdValueTruncated ? '$' + usdValueTruncated : '…';
};

import { formatAmountOld } from '../../../../../../utils/numbers';
import { getFormattedTokenBalance } from '../../../../../functions/getFormattedTokenBalance';

// TODO: consolidate duplicates of this function
export const getValueUSD = (value: number): string => {
    const usdValueTruncated = !value
        ? undefined
        : value < 0.0001
        ? value.toExponential(2)
        : value < 2
        ? value.toPrecision(3)
        : value >= 10000
        ? formatAmountOld(value, 1)
        : value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
    return usdValueTruncated ? '$' + usdValueTruncated : '…';
};

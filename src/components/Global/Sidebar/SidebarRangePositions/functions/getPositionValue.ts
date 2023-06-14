import { formatAmountOld } from '../../../../../utils/numbers';

// TODO: consolidate duplicate usd formatting
export const getPositionValue = (value: number): string => {
    const usdValueTruncated = !value
        ? '0.00'
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

    return '$' + usdValueTruncated;
};

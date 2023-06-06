import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { formatAmountOld } from '../../../../../utils/numbers';

export const getTxValue = (tx: TransactionIF): string => {
    const totalValueUSDTruncated = !tx.totalValueUSD
        ? undefined
        : tx.totalValueUSD < 0.001
        ? tx.totalValueUSD.toExponential(2)
        : tx.totalValueUSD < 2
        ? tx.totalValueUSD.toPrecision(3)
        : tx.totalValueUSD >= 10000
        ? formatAmountOld(tx.totalValueUSD, 1)
        : tx.totalValueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    return totalValueUSDTruncated ? '$' + totalValueUSDTruncated : '…';
};

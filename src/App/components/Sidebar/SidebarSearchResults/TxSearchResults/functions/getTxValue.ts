import { TransactionIF } from '../../../../../../utils/interfaces/TransactionIF';
import { formatAmountOld } from '../../../../../../utils/numbers';

/**
 *      I do not know how this code works, consult Ben with questions
 *      -Emily
 */

// TODO (#1531): unit test coverage for this function.
export const getTxValue = (tx: TransactionIF): string => {
    const totalValueUSD = tx.totalValueUSD;

    return totalValueUSD < 0.001
        ? totalValueUSD.toExponential(2)
        : totalValueUSD < 2
        ? totalValueUSD.toPrecision(3)
        : totalValueUSD >= 10000
        ? formatAmountOld(totalValueUSD, 1)
        : totalValueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });
};

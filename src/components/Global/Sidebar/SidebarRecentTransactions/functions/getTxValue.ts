import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { formatAmountOld } from '../../../../../utils/numbers';

export const getTxValue = (tx: TransactionIF): string => {
    const totalFlowAbsNum = tx.totalFlowUSD !== undefined ? Math.abs(tx.totalFlowUSD) : undefined;

    const usdValueTruncated = !tx.valueUSD
        ? undefined
        : tx.valueUSD < 0.001
        ? tx.valueUSD.toExponential(2)
        : tx.valueUSD < 2
        ? tx.valueUSD.toPrecision(3)
        : tx.valueUSD >= 10000
        ? formatAmountOld(tx.valueUSD, 1)
        : tx.valueUSD.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

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

    const totalFlowUSDTruncated =
        totalFlowAbsNum === undefined
            ? undefined
            : totalFlowAbsNum === 0
            ? '0.00'
            : totalFlowAbsNum < 0.001
            ? totalFlowAbsNum.toExponential(2)
            : totalFlowAbsNum < 2
            ? totalFlowAbsNum.toPrecision(3)
            : totalFlowAbsNum >= 10000
            ? formatAmountOld(totalFlowAbsNum, 1)
            : totalFlowAbsNum.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
    
    return (
        totalFlowUSDTruncated !== undefined
            ? '$' + totalFlowUSDTruncated
            : totalValueUSDTruncated
            ? '$' + totalValueUSDTruncated
            : usdValueTruncated
            ? '$' + usdValueTruncated
            : '…'
    );
}
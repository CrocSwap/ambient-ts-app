import { formatAmountOld } from '../../../../../../utils/numbers';

/**
 *      I do not know how this code works, consult Ben with questions
 *      -Emily
 */

export const getTxValue = (
    valueUSD: number,
    totalValueUSD: number,
    totalFlowUSD: number,
): string => {
    const totalFlowAbsNum: number | undefined =
        totalFlowUSD !== undefined ? Math.abs(totalFlowUSD) : undefined;

    const usdValueTruncated: string | undefined = !valueUSD
        ? undefined
        : valueUSD < 0.001
        ? valueUSD.toExponential(2)
        : valueUSD < 2
        ? valueUSD.toPrecision(3)
        : valueUSD >= 10000
        ? formatAmountOld(valueUSD, 1)
        : valueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const totalValueUSDTruncated: string | undefined = !totalValueUSD
        ? undefined
        : totalValueUSD < 0.001
        ? totalValueUSD.toExponential(2)
        : totalValueUSD < 2
        ? totalValueUSD.toPrecision(3)
        : totalValueUSD >= 10000
        ? formatAmountOld(totalValueUSD, 1)
        : totalValueUSD.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const totalFlowUSDTruncated: string | undefined =
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
            : // ? baseLiqDisplayNum.toExponential(2)
              totalFlowAbsNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    const output: string =
        totalFlowUSDTruncated !== undefined
            ? '$' + totalFlowUSDTruncated
            : totalValueUSDTruncated
            ? '$' + totalValueUSDTruncated
            : usdValueTruncated
            ? '$' + usdValueTruncated
            : '…';

    return output;
};

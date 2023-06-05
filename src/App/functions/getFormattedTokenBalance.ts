import { formatAmountOld } from '../../utils/numbers';

export const getFormattedTokenBalance = (
    balance: number,
    nativeBalance?: number,
    minFracDigits = 2,
    maxFracDigits = 2,
) => {
    if (balance === 0) {
        return '0.00';
    } else if (balance < 0.0001) {
        return balance.toExponential(2);
    } else if (balance < 2) {
        return balance.toPrecision(3);
    } else if (balance >= 100000) {
        if (nativeBalance !== undefined) {
            return formatAmountOld(nativeBalance);
        } else {
            return formatAmountOld(balance);
        }
    } else {
        return balance.toLocaleString(undefined, {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
        });
    }
};

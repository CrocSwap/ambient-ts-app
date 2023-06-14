import { formatAmountOld } from '../../utils/numbers';

type FormatParams = {
    balance?: number;
    secondaryBalance?: number;
    formatSecondaryBalance?: (
        num: number | undefined,
        digits?: number,
    ) => string;
    nullDisplay?: string;
    zeroDisplay?: string;
    prefix?: string;
    suffix?: string;
    minFracDigits?: number;
    maxFracDigits?: number;
};

export function getFormattedTokenBalance({
    balance,
    secondaryBalance,
    formatSecondaryBalance = formatAmountOld,
    nullDisplay = '…',
    zeroDisplay = '0.00',
    prefix = '',
    suffix = '',
    minFracDigits = 2,
    maxFracDigits = 2,
}: FormatParams) {
    let tokenBalance;
    if (balance === undefined) {
        return nullDisplay;
    } else if (balance === 0) {
        tokenBalance = zeroDisplay;
    } else if (balance < 0.0001) {
        tokenBalance = balance.toExponential(2);
    } else if (balance < 2) {
        tokenBalance = balance.toPrecision(3);
    } else if (balance >= 100000) {
        tokenBalance = formatSecondaryBalance(secondaryBalance ?? balance);
    } else {
        tokenBalance = balance.toLocaleString(undefined, {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
        });
    }
    return `${prefix}${tokenBalance}${suffix}`;
}

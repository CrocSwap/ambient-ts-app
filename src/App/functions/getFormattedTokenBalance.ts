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
    } else if (balance === Infinity) {
        tokenBalance = '∞';
    } else if (balance < 0.0001) {
        tokenBalance = formatSubscript(balance);
    } else if (balance >= 1000) {
        tokenBalance = formatSecondaryBalance(secondaryBalance ?? balance);
    } else {
        tokenBalance = balance.toLocaleString(undefined, {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
        });
    }
    return `${prefix}${tokenBalance}${suffix}`;
}

const formatSubscript = (balance: number, precision = 3) => {
    const zeros = Math.ceil(Math.log10(1 / balance)) - 1;
    switch (zeros) {
        case 4:
            return `0.0\u{2084}${Math.round(
                balance * 10 ** (zeros + precision),
            ).toPrecision(precision)}`;
        case 5:
            return `0.0\u{2085}${Math.round(
                balance * 10 ** (zeros + precision),
            ).toPrecision(precision)}`;
        case 6:
            return `0.0\u{2086}${Math.round(
                balance * 10 ** (zeros + precision),
            ).toPrecision(precision)}`;
        case 7:
            return `0.0\u{2087}${Math.round(
                balance * 10 ** (zeros + precision),
            ).toPrecision(precision)}`;
        case 8:
            return `0.0\u{2088}${Math.round(
                balance * 10 ** (zeros + precision),
            ).toPrecision(precision)}`;
        case 9:
            return `0.0\u{2089}${Math.round(
                balance * 10 ** (zeros + precision),
            ).toPrecision(precision)}`;
        default:
            return '...';
    }
};

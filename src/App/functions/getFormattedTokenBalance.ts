import numbro from 'numbro';

type FormatParams = {
    balance?: number;
    nullDisplay?: string;
    zeroDisplay?: string;
    prefix?: string;
    suffix?: string;
    minFracDigits?: number;
    maxFracDigits?: number;
    isUSD?: boolean;
};

export function getFormattedTokenBalance({
    balance,
    nullDisplay = '…',
    zeroDisplay = '0.00',
    prefix = '',
    suffix = '',
    minFracDigits = 2,
    maxFracDigits = 2,
    isUSD = false,
}: FormatParams) {
    let tokenBalance = '';
    if (balance === 0) {
        tokenBalance = zeroDisplay;
    } else if (!balance) {
        return nullDisplay;
    } else if (balance === Infinity) {
        tokenBalance = '∞';
    } else if (isUSD) {
        tokenBalance = balance.toFixed(2);
    } else if (balance <= 0.0001) {
        tokenBalance = formatSubscript(balance);
    } else if (balance < 1) {
        tokenBalance = balance.toPrecision(3);
    } else if (balance < 2) {
        tokenBalance = balance.toFixed(3);
    } else if (balance >= 10000) {
        tokenBalance = formatAbbrev(balance);
    } else {
        tokenBalance = balance.toLocaleString(undefined, {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
        });
    }
    return `${prefix}${tokenBalance}${suffix}`;
}

const subscriptUnicode = [
    '',
    '0',
    '0\u{2082}',
    '0\u{2083}',
    '0\u{2084}',
    '0\u{2085}',
    '0\u{2086}',
    '0\u{2087}',
    '0\u{2088}',
    '0\u{2089}',
];

const formatSubscript = (value: number, precision = 3) => {
    const zeros = Math.ceil(Math.log10(1 / value)) - 1;
    const valueNonZero = Math.round(value * 10 ** (zeros + precision));
    if (zeros > 9) {
        console.error('Math error computing subscript!');
        return '...';
    }
    return `0.${subscriptUnicode[zeros]}${valueNonZero}`.replace(/0+$/, '');
};

const formatAbbrev = (value: number) => {
    return numbro(value).format({
        average: true,
        mantissa: 1,
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'B',
        },
    });
};

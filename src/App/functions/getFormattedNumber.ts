import numbro from 'numbro';

type FormatParams = {
    value?: number;
    nullDisplay?: string;
    zeroDisplay?: string;
    prefix?: string;
    suffix?: string;
    minFracDigits?: number;
    maxFracDigits?: number;
    isUSD?: boolean;
    isInput?: boolean;
};

export function getFormattedNumber({
    value,
    nullDisplay = '…',
    zeroDisplay = '0.00',
    prefix = '',
    suffix = '',
    minFracDigits = 2,
    maxFracDigits = 2,
    isUSD = false,
    isInput = false,
}: FormatParams) {
    let valueString = '';
    if (value === 0) {
        valueString = zeroDisplay;
    } else if (!value) {
        return nullDisplay;
    } else if (value === Infinity) {
        valueString = '∞';
    } else if (isUSD) {
        valueString = value.toFixed(2);
    } else if (isInput) {
        if (value <= 10)
            // prevent scientific notation for inputs
            valueString = Number(value?.toPrecision(3)).toLocaleString(
                undefined,
                { maximumFractionDigits: 20 },
            );
        else
            valueString = value.toLocaleString(undefined, {
                minimumFractionDigits: minFracDigits,
                maximumFractionDigits: maxFracDigits,
            });
    } else if (value <= 0.0001) {
        valueString = formatSubscript(value);
    } else if (value < 1) {
        valueString = value.toPrecision(3);
    } else if (value < 2) {
        valueString = value.toFixed(3);
    } else if (value >= 10000 && !isInput) {
        valueString = formatAbbrev(value);
    } else {
        valueString = value.toLocaleString(undefined, {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
        });
    }
    return `${prefix}${valueString}${suffix}`;
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
    '0\u{2081}\u{2080}',
    '0\u{2081}\u{2081}',
    '0\u{2081}\u{2082}',
    '0\u{2081}\u{2083}',
    '0\u{2081}\u{2084}',
    '0\u{2081}\u{2085}',
    '0\u{2081}\u{2086}',
    '0\u{2081}\u{2087}',
    '0\u{2081}\u{2088}',
    '0\u{2081}\u{2089}',
    '0\u{2082}\u{2080}',
];

const formatSubscript = (value: number, precision = 3) => {
    const zeros = Math.ceil(Math.log10(1 / value)) - 1;
    const valueNonZero = Math.round(value * 10 ** (zeros + precision));
    if (zeros > 20) {
        return '0';
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
            trillion: 'T',
        },
    });
};

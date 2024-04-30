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
    isTvl?: boolean;
    isToken?: boolean;
    removeCommas?: boolean;
    abbrevThreshold?: number;
    isLevel?: boolean;
    isPercentage?: boolean;
    mantissa?: number;
};

export function getFormattedNumber({
    value,
    nullDisplay = '…',
    isUSD = false,
    zeroDisplay = isUSD ? '$0.00' : '0.00',
    prefix = '',
    suffix = '',
    minFracDigits = 2,
    maxFracDigits = 2,
    isInput = false,
    isTvl = false,
    isToken = false,
    removeCommas = false,
    abbrevThreshold = 10000,
    isLevel = false,
    isPercentage = false,
    mantissa = 2,
}: FormatParams) {
    let valueString = '';
    if (value === 0) {
        valueString = zeroDisplay;
    } else if (!value) {
        return nullDisplay;
    } else if (value === Infinity) {
        valueString = '∞';
    } else if (isUSD) {
        // only display two decimal points for USD values
        valueString = value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        prefix = '$';
    } else if (isToken) {
        if (isNaN(value)) {
            valueString = '';
        } else {
            // handle scientific notation
            valueString = (+value).toString();
        }
    } else if (isInput) {
        removeCommas = true;
        if (value < 0.0001) {
            valueString = value.toExponential(2);
        } else if (value < 2) {
            valueString = value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
            });
        } else if (value <= 10) {
            // prevent scientific notation for inputs
            valueString = Number(value?.toPrecision(4)).toString();
        } else {
            valueString = value.toLocaleString('en-US', {
                minimumFractionDigits: minFracDigits,
                maximumFractionDigits: maxFracDigits,
            });
        }
    } else if (isLevel || isPercentage) {
        if (Math.abs(value) >= abbrevThreshold) {
            // use abbreviations (k, M, B, T) for big numbers
            valueString = formatAbbrev(value, false, mantissa);
        } else {
            valueString = value.toLocaleString('en-US', {
                minimumFractionDigits: minFracDigits,
                maximumFractionDigits: maxFracDigits,
            });
        }
    } else if (Math.abs(value) <= 0.0001) {
        // use subscript format for small numbers
        if (value < 0) {
            valueString = '-' + formatSubscript(Math.abs(value));
        } else {
            valueString = formatSubscript(value);
        }
    } else if (Math.abs(value) < 0.1) {
        // show 4 significant digits (after 0s) -- useful for ETH/WBTC
        valueString = value.toPrecision(4);
    } else if (Math.abs(value) < 0.9) {
        // show 3 significant digits (after 0s)
        valueString = value.toPrecision(3);
    } else if (Math.abs(value) < 1.2) {
        // restrict to 5 places after decimal
        valueString = value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 5,
        });
    } else if (Math.abs(value) < 100) {
        // restrict to 3 places after decimal
        valueString = value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3,
        });
    } else if (Math.abs(value) >= abbrevThreshold && !isInput) {
        // use abbreviations (k, M, B, T) for big numbers
        valueString = formatAbbrev(value, isTvl, mantissa);
    } else {
        valueString = value.toLocaleString('en-US', {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
        });
    }

    if (removeCommas) valueString = valueString.replaceAll(',', '');
    return `${prefix}${valueString}${suffix}`;
}

// unicode for subscript - currently support up to 20
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
    // math to find number of 0s after the decimal
    const zeros = Math.ceil(Math.log10(1 / value)) - 1;
    const valueNonZero = Math.round(value * 10 ** (zeros + precision));
    if (zeros > 20) {
        return '0';
    }
    return `0.${subscriptUnicode[zeros]}${valueNonZero}`;
};

const formatAbbrev = (value: number, isTvl?: boolean, mantissa = 2) => {
    return numbro(value).format({
        average: true,
        ...(isTvl && { roundingFunction: (num: number) => Math.floor(num) }),
        mantissa: mantissa,
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'B',
            trillion: 'T',
        },
    });
};

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
    removeExtraTrailingZeros?: boolean;
    isTickerDisplay?: boolean;
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
    removeExtraTrailingZeros = false,
    isTickerDisplay = false,
}: FormatParams) {
    let valueString = '';
    if (value === 0) {
        valueString = zeroDisplay;
    } else if (!value) {
        return nullDisplay;
    } else if (value === Infinity) {
        valueString = '∞';
    } else if (isTickerDisplay) {
        valueString =
            value <= 1000
                ? formatAbbrev(value, false, 0)
                : value < 100000
                  ? formatAbbrev(value, false, 1)
                  : value < 1000000
                    ? formatAbbrev(value, false, 0)
                    : formatAbbrev(value, false, 1);
        prefix = '$';
    } else if (isUSD) {
        // only display two decimal points for USD values
        valueString = value.toLocaleString('en-US', {
            minimumFractionDigits: minFracDigits,
            maximumFractionDigits: maxFracDigits,
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
    if (removeExtraTrailingZeros)
        valueString = removeMoreThanOneTrailingZeros(valueString);
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
export const formatSubscript = (value: number, precision = 3) => {
    if (value === 0) return '0';

    // Calculate the exponent (e.g., for 0.0001, exp should be 4).
    const exp = -Math.log10(value);

    // Set a tolerance to decide when exp is "close enough" to an integer.
    // You may need to adjust this epsilon based on your precision needs.
    const tolerance = 1e-8;
    const normalizedExp =
        Math.abs(exp - Math.round(exp)) < tolerance
            ? Math.round(exp)
            : Math.ceil(exp);

    // The number of leading zeros (e.g., 0.0001 has 3 zeros: "0.0001")
    const zeros = normalizedExp - 1;

    // Multiply the value to shift out the zeros and round according to precision.
    const valueNonZero = Math.round(value * 10 ** (zeros + precision));

    if (zeros > 20) {
        return '0';
    }

    // Assume subscriptUnicode is an array mapping counts to subscript digits.
    return `0.${subscriptUnicode[zeros]}${valueNonZero}`;
};

const formatAbbrev = (value: number, isTvl?: boolean, mantissa = 2) => {
    return numbro(value).format({
        average: true,
        ...(isTvl
            ? { roundingFunction: (num: number) => Math.floor(num) }
            : { roundingFunction: (num: number) => num }),
        mantissa: mantissa,
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'B',
            trillion: 'T',
        },
    });
};

export function removeMoreThanOneTrailingZeros(amount: string) {
    /* 
    The regex:
    (\.[0-9]*[1-9]) captures the decimal part with a non-zero digit
    0+ matches multiple trailing zeros
    (?=0$) is a positive lookahead that ensures there's still a zero at the end
    Replaces with just the captured decimal part plus the last zero
    */
    return amount.replace(/(\.[0-9]*[1-9])0+(?=0$)/, '$1');
}

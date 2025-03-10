import numbro from 'numbro';
import { getFormattedNumber } from '../ambient-utils/dataLayer';
import { TokenIF } from '../ambient-utils/types';

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (
    num: number | undefined,
    digits = 2,
    round = true,
) => {
    if (num === 0) return '$0.00';
    if (!num) return '-';
    if (num < 0.001 && digits <= 3) {
        return '<$0.001';
    }

    return numbro(num).formatCurrency({
        average: round,
        mantissa: num > 1000 ? 2 : digits,
        abbreviations: {
            million: 'M',
            billion: 'B',
        },
    });
};

export const formatDollarAmountAxis = (
    num: number | undefined,
    isTvl?: boolean,
) => {
    const digits = num != undefined ? num.toString().length : 0;
    if (num === 0) return '$0.00';
    if (num === undefined) return '-';
    if (!num) return '-';
    if (num < 0.001 && digits <= 3) {
        return '<$0.001';
    }

    return numbro(num).formatCurrency({
        average: true,
        ...(isTvl && { roundingFunction: (num: number) => Math.floor(num) }),
        mantissa: 2,
        // mantissa: num > 1000 ? 2 : num < 100 ? 5 : digits,
        abbreviations: {
            million: 'M',
            billion: 'B',
            thousand: 'k',
        },
    });
};

export const formatPoolPriceAxis = (
    num: number | undefined,
    digits: undefined | number = undefined,
) => {
    const digit = digits
        ? digits
        : num != undefined
          ? num.toString().length
          : 0;
    if (num === 0) return '0.00';
    if (num === undefined) return '-';
    if (!num) return '-';
    if (num < 0.001 && digit <= 3) {
        return '<0.001';
    }

    return num > 99999 || num < 1
        ? numbro(num).format({
              average: true,
              mantissa: num < 1 ? 5 : 2,
              // mantissa: num > 1000 ? 2 : num < 100 ? 5 : digits,
              abbreviations: {
                  million: 'M',
                  billion: 'B',
              },
          })
        : num.toString();
};

// using a currency library here in case we want to add more in future
export const formatAmountChartData = (
    num: number | undefined,
    digits: undefined | number = undefined,
) => {
    if (num === 0) return '0';
    if (!num) return '-';
    if (num.toString().includes('e')) return num + '.00';

    const a = numbro(num).format({
        // average: num > 0 || num < 10000 ? false : true,
        mantissa: digits
            ? digits
            : num > 10 || num < -10
              ? 2
              : (num > 1 && num <= 10) || (num >= -10 && num < -1)
                ? 3
                : (num <= 1 && num >= 0.001) || (num >= -1 && num <= -0.001)
                  ? 5
                  : (num < 0.001 && num > 0) || (num < 0 && num > -0.001)
                    ? 7
                    : 2,

        // mantissa: num > 1000 ? 2 : digits,
        abbreviations: {
            million: 'M',
            billion: 'B',
        },
    });
    return a;
};

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2) => {
    if (num === 0) return '0';
    if (!num) return '-';
    if (num < 0.001) {
        return '<0.001';
    }

    const a = numbro(num).format({
        average: num > 1000 ? false : num < 100 ? true : false,
        mantissa: num > 1000 ? 2 : num < 100 ? 5 : digits,
        thousandSeparated: true,

        // mantissa: num > 1000 ? 2 : digits,
        abbreviations: {
            million: 'M',
            billion: 'B',
        },
    });
    return a;
};
export const formatAmountWithoutDigit = (
    num: number | undefined,
    digits = 2,
) => {
    if (num === 0) return '0';
    if (!num) return '-';
    if (num < 0.001) {
        return '<0.001';
    }

    const a = numbro(num).format({
        average: num > 1000 ? false : num < 100 ? true : false,
        mantissa: digits,
        thousandSeparated: true,

        // mantissa: num > 1000 ? 2 : digits,
        abbreviations: {
            million: 'M',
            billion: 'B',
        },
    });
    return a;
};

export const formatAmountOld = (num: number | undefined, digits = 1) => {
    if (num === 0) return '0';
    if (!num) return '-';
    if (num < 0.001) {
        return '<0.001';
    }
    return numbro(num).format({
        average: true,
        mantissa: num < 100 ? 2 : digits,
        // mantissa: num > 1000 ? 2 : digits,
        abbreviations: {
            thousand: 'k',
            million: 'M',
            billion: 'B',
        },
    });
};

export const formatTokenInput = (
    value: string,
    token: TokenIF,
    shouldTruncate = false,
) => {
    const inputStr = value.replaceAll(',', '');
    if (!inputStr) return '';
    if (!shouldTruncate)
        return getFormattedNumber({
            value: inputStr ? +inputStr : undefined,
            isToken: true,
            nullDisplay: '',
        });
    // remove trailing zeros
    return inputStr.replace(/0+$/, '').replace(/\.$/, '');
};

export function stringToBigInt(tokenString: string, decimals: number) {
    // Validate input before processing
    if (!isValidNumberString(tokenString)) {
        return 0n;
    }

    // Normalize tokenString to handle exponential formats like "1e-2"
    const normalizedString = normalizeExponential(tokenString, decimals);

    // Split the normalized string into integer and decimal parts
    // eslint-disable-next-line prefer-const
    let [integerPart, decimalPart = ''] = normalizedString.split('.');

    // Ensure the decimal part is 'decimals' long by padding or truncating
    decimalPart = decimalPart.padEnd(decimals, '0').substring(0, decimals);

    // Combine the integer and decimal parts into a single string
    const combined = `${integerPart}${decimalPart}`;

    // Convert to a BigInt
    const tokenQuantity = BigInt(combined);

    // Return the BigInt representation
    return tokenQuantity;
}

// Helper function to validate the number string
export function isValidNumberString(value: string): boolean {
    // Check if the string is a valid number or exponential notation
    return /^-?\d+(\.\d+)?(e[-+]?\d+)?$/i.test(value.trim());
}

// Helper function to normalize exponential numbers
export function normalizeExponential(value: string, decimals: number): string {
    if (!value.toLowerCase().includes('e')) {
        return value;
    }
    const num = Number(value);
    if (!isNaN(num) && isFinite(num)) {
        return num.toFixed(decimals).replace(/\.?0+$/, ''); // High precision to avoid rounding errors
    }
    throw new Error(`Invalid or non-finite number: "${value}"`);
}

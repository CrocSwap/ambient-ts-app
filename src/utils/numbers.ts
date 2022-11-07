import numbro from 'numbro';

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 2, round = true) => {
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

export const formatDollarAmountAxis = (num: number | undefined) => {
    const digits = num != undefined ? num.toString().length : 0;
    if (num === 0) return '$0.00';
    if (!num) return '-';
    if (num < 0.001 && digits <= 3) {
        return '<$0.001';
    }

    return numbro(num).formatCurrency({
        average: true,
        mantissa: num > 1000 ? 2 : num < 100 ? 5 : digits,
        abbreviations: {
            million: 'M',
            billion: 'B',
            thousand: 'K',
        },
    });
};

// using a currency library here in case we want to add more in future
export const formatAmountChartData = (num: number | undefined, digits = 2) => {
    if (num === 0) return '0';
    if (!num) return '-';

    const a = numbro(num).format({
        average: num > 0 || num < 10000 ? false : true,
        mantissa: num > 1000 ? 2 : num < 1 ? 7 : num < 100 ? 5 : digits,

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

/**
 * Formats a number of days into a human-readable string representation of a time range.
 * @param days - Number of days to format.
 * @returns A string representing the formatted time range.
 */

export function formatDaysRange(days: number) {
    // TODO (#1570): consider using Moment() here vs implementing this calculation
    if (!isFinite(days)) {
        return formatNumString(days); // Infinity
    } else if (days > 365 * 5) {
        return formatNumString(days / 365) + ' years';
    } else if (days > 91.5) {
        return formatNumString(days / 30.5) + ' months';
    } else if (days > 21) {
        return formatNumString(days / 7) + ' weeks';
    } else if (days > 3) {
        return formatNumString(days) + ' days';
    } else {
        return formatNumString(days * 24) + ' hours';
    }
}
/**
 * Formats a number into a locale string representation with no fractional digits.
 * @param x - Number to format.
 * @returns A string representing the formatted number.
 */
function formatNumString(x: number): string {
    return x.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

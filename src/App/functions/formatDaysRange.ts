export function formatDaysRange(days: number) {
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

function formatNumString(x: number): string {
    return x.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

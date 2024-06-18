export function getTimeRemaining(
    remainingTimeInSecondsNum: number | undefined,
): string {
    const remainingTimeString =
        remainingTimeInSecondsNum !== undefined
            ? remainingTimeInSecondsNum < 0
                ? 'COMPLETE'
                : remainingTimeInSecondsNum < 60
                ? '< 1m'
                : remainingTimeInSecondsNum < 120
                ? '1m'
                : remainingTimeInSecondsNum < 3600
                ? `${Math.floor(remainingTimeInSecondsNum / 60)}m`
                : remainingTimeInSecondsNum < 7200
                ? '1h'
                : remainingTimeInSecondsNum < 86400
                ? `${Math.floor(remainingTimeInSecondsNum / 3600)}h`
                : remainingTimeInSecondsNum < 172800
                ? '1d'
                : `${Math.floor(remainingTimeInSecondsNum / 86400)}d`
            : 'Pending...';

    return remainingTimeString;
}

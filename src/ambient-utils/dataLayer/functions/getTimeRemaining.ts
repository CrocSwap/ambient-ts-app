import moment from 'moment';

export function getTimeRemaining(remainingTimeInSecondsNum: number): string {
    const duration = moment.duration(remainingTimeInSecondsNum, 'seconds');
    const days = Math.floor(duration.asDays());
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    const secs = Math.floor(duration.seconds());

    const hoursMinusDays = hours - days * 24;

    const daysAndHours =
        days > 0
            ? hoursMinusDays > 0
                ? `${String(days).padStart(2, '0') + 'd'}:${String(hoursMinusDays).padStart(2, '0') + 'h'}`
                : `${String(days).padStart(2, '0') + 'd'}`
            : `${hours}h`;

    return `${daysAndHours}:${String(minutes).padStart(2, '0')}m:${String(secs).padStart(2, '0')}s`;
}
export function getTimeRemainingAbbrev(
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

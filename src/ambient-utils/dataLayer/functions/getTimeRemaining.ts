import moment from 'moment';

export function getTimeRemaining(remainingTimeInSecondsNum: number): string {
    const duration = moment.duration(remainingTimeInSecondsNum, 'seconds');
    const days = Math.floor(duration.asDays());
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    const secs = Math.floor(duration.seconds());

    if (remainingTimeInSecondsNum < 0) {
        const elapsedSeconds = Math.abs(remainingTimeInSecondsNum);
        const elapsedTimeString =
            elapsedSeconds < 60
                ? '< 1 minute ago'
                : elapsedSeconds < 120
                  ? '1 minute ago'
                  : elapsedSeconds < 3600
                    ? `${Math.floor(elapsedSeconds / 60)} minutes ago `
                    : elapsedSeconds < 7200
                      ? '1 hour ago'
                      : elapsedSeconds < 86400
                        ? `${Math.floor(elapsedSeconds / 3600)} hours ago `
                        : elapsedSeconds < 172800
                          ? '1 day ago'
                          : `${Math.floor(elapsedSeconds / 86400)} days ago `;
        return elapsedTimeString;
    } else {
        const hoursMinusDays = hours - days * 24;

        const daysAndHours =
            days > 0
                ? hoursMinusDays > 0
                    ? `${String(days).padStart(2, '0') + 'd'}:${String(hoursMinusDays).padStart(2, '0') + 'h'}`
                    : `${String(days).padStart(2, '0') + 'd'}`
                : `${hours}h`;

        return `${daysAndHours}:${String(minutes).padStart(2, '0')}m:${String(secs).padStart(2, '0')}s`;
    }
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

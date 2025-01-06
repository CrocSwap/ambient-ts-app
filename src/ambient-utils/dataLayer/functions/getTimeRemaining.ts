import moment from 'moment';

export function getTimeDifference(remainingTimeInSecondsNum: number): string {
    const duration = moment.duration(remainingTimeInSecondsNum, 'seconds');
    const days = Math.floor(duration.asDays());
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    const secs = Math.floor(duration.seconds());

    if (remainingTimeInSecondsNum < 0) {
        const elapsedSeconds = Math.abs(remainingTimeInSecondsNum);
        const elapsedTimeString =
            elapsedSeconds < 60
                ? '< 1 min. ago'
                : elapsedSeconds < 120
                  ? '1 min. ago'
                  : elapsedSeconds < 3600
                    ? `${Math.floor(elapsedSeconds / 60)} minutes ago `
                    : elapsedSeconds < 7200
                      ? '1 hour ago'
                      : elapsedSeconds < 86400
                        ? `${Math.floor(elapsedSeconds / 3600)} hours ago `
                        : elapsedSeconds < 172800
                          ? '1 day ago'
                          : elapsedSeconds < 604800 // less than 1 week
                            ? `${Math.floor(elapsedSeconds / 86400)} days ago`
                            : elapsedSeconds < 1209600 // less than 2 weeks
                              ? '1 week ago'
                              : `${Math.floor(elapsedSeconds / 604800)} weeks ago `;
        return elapsedTimeString;
    } else {
        const hoursMinusDays = hours - days * 24;

        const daysAndHours =
            days > 0
                ? hoursMinusDays > 0
                    ? `${String(days).padStart(2, '0') + 'd'}:${String(hoursMinusDays).padStart(2, '0') + 'h'}:`
                    : days === 1
                      ? '24h:'
                      : `${String(days).padStart(2, '0') + 'd'}:00h:`
                : hours > 0
                  ? `${String(hours).padStart(2, '0')}h:`
                  : '';

        const daysAndHoursAndMinutes = `${daysAndHours}${String(minutes).padStart(2, '0')}m`;

        return days > 1 || (days === 1 && hoursMinusDays !== 0)
            ? daysAndHoursAndMinutes
            : `${daysAndHoursAndMinutes}:${String(secs).padStart(2, '0')}s`;
    }
}
export function getTimeDifferenceAbbrev(
    remainingTimeInSecondsNum: number,
): string {
    const duration = moment.duration(remainingTimeInSecondsNum, 'seconds');
    const days = Math.floor(duration.asDays());
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.minutes());
    const secs = Math.floor(duration.seconds());

    if (remainingTimeInSecondsNum < 0) {
        const elapsedSeconds = Math.abs(remainingTimeInSecondsNum);
        const elapsedTimeString =
            elapsedSeconds < 60 // less than 1 minute
                ? '< 1m ago'
                : elapsedSeconds < 120 // less than 2 minutes
                  ? '1m ago'
                  : elapsedSeconds < 3600 // less than 1 hour
                    ? `${Math.floor(elapsedSeconds / 60)}m ago `
                    : elapsedSeconds < 7200 // less than 2 hours
                      ? '1h ago'
                      : elapsedSeconds < 86400 // less than 1 day
                        ? `${Math.floor(elapsedSeconds / 3600)} hr. ago `
                        : elapsedSeconds < 172800 // less than 2 days
                          ? '1d ago'
                          : elapsedSeconds < 604800 // less than 1 week
                            ? `${Math.floor(elapsedSeconds / 86400)}d ago`
                            : elapsedSeconds < 1209600 // less than 2 weeks
                              ? '1w ago'
                              : `${Math.floor(elapsedSeconds / 604800)}w ago `;
        return elapsedTimeString;
    } else {
        const hoursMinusDays = hours - days * 24;

        const daysAndHours =
            days > 0
                ? hoursMinusDays > 0
                    ? `${String(days).padStart(2, '0') + 'd'}:${String(hoursMinusDays).padStart(2, '0') + 'h'}:`
                    : days === 1
                      ? '24h:'
                      : `${String(days).padStart(2, '0') + 'd'}:00h:`
                : hours > 0
                  ? `${String(hours).padStart(2, '0')}h:`
                  : '';

        const daysAndHoursAndMinutes = `${daysAndHours}${String(minutes).padStart(2, '0')}m`;

        return days > 1 || (days === 1 && hoursMinusDays !== 0)
            ? daysAndHoursAndMinutes
            : `${daysAndHoursAndMinutes}:${String(secs).padStart(2, '0')}s`;
    }
}
export function getTimeRemainingAbbrev(
    remainingTimeInSecondsNum: number | undefined,
): string {
    const remainingTimeString =
        remainingTimeInSecondsNum !== undefined
            ? remainingTimeInSecondsNum < 0
                ? 'DONE'
                : remainingTimeInSecondsNum < 60
                  ? '< 01m'
                  : remainingTimeInSecondsNum < 120
                    ? '01m'
                    : remainingTimeInSecondsNum < 3600
                      ? `${String(Math.floor(remainingTimeInSecondsNum / 60)).padStart(2, '0')}m`
                      : remainingTimeInSecondsNum < 7200
                        ? '01h'
                        : remainingTimeInSecondsNum < 86400
                          ? `${String(Math.floor(remainingTimeInSecondsNum / 3600)).padStart(2, '0')}h`
                          : remainingTimeInSecondsNum < 172800
                            ? '01d'
                            : `${String(Math.floor(remainingTimeInSecondsNum / 86400)).padStart(2, '0')}d`
            : 'Pending...';

    return remainingTimeString;
}

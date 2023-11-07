import { useEffect, useState } from 'react';
import { getElapsedTime } from '../../App/functions/getElapsedTime';
import moment from 'moment';

export interface useTimeElapsedIF {
    value: string;
    reset: () => void;
}

export const useTimeElapsed = (
    poolCount: number,
    retrievedAt: number | null,
    block: number,
): useTimeElapsedIF => {
    // time since data was retrieved to display in DOM
    const [timeSince, setTimeSince] = useState<string>('');
    // logic to update DOM text with time since data was retrieved
    useEffect((): void => updateTime(), [block, poolCount]);

    // fn to update DOM string
    function updateTime(): void {
        // run logic if the hook has a `retrieved` at value (or return default)
        if (retrievedAt) {
            // time elapsed since fetch in seconds
            const elapsedTime: number = moment(Date.now()).diff(
                retrievedAt,
                'seconds',
            );
            // update the DOM with a readable text string
            setTimeSince(
                'Last Updated: ' + getElapsedTime(elapsedTime) + ' ago',
            );
        } else {
            resetTime();
        }
    }

    // fn to reset DOM string
    function resetTime(): void {
        setTimeSince('');
    }

    return {
        value: timeSince,
        reset: resetTime,
    };
};

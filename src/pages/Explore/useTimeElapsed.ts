import { useEffect, useState } from 'react';

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
        // time constants (ms per unit time)
        const ONE_SECOND = 1000;
        const ONE_MINUTE = 60000;
        // fn to turn ms into a human-readable value (minutes or seconds)
        const calcTime = (
            timeInMs: number,
            denom: 'minutes' | 'seconds',
        ): string => {
            // get divisor for specified time interval
            const divisor = denom === 'minutes' ? ONE_MINUTE : ONE_SECOND;
            // return number of wholse minutes or seconds as relevant
            return Math.floor(timeInMs / divisor).toString();
        };
        // run logic if the hook has a `retrieved` at value (or return default)
        if (retrievedAt) {
            // time elapsed since fetch in ms
            const elapsedTime: number = Date.now() - retrievedAt;
            // logic router to get human-readable string for DOM
            let elapsedText: string;
            if (elapsedTime > ONE_MINUTE * 30) {
                elapsedText = '> 30 min';
            } else if (elapsedTime >= ONE_MINUTE) {
                elapsedText = calcTime(elapsedTime, 'minutes') + ' min ago';
            } else if (elapsedTime >= ONE_SECOND) {
                elapsedText = calcTime(elapsedTime, 'seconds') + ' sec ago';
            } else {
                elapsedText = 'just now';
            }
            // update the DOM with a readable text string
            setTimeSince('updated: ' + elapsedText);
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

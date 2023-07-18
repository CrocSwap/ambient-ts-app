import { useEffect, useRef, useState } from 'react';

export interface useTimeElapsedIF {
    value: string;
    reset: () => void;
}

export const useTimeElapsed = (retrievedAt: number | null) => {
    // time since data was retrieved to display in DOM
    const [timeSince, setTimeSince] = useState<string>('');
    // logic to update DOM text with time since data was retrieved
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        // constant defining 1s in ms
        const ONE_SECOND = 1000;
        // logic to translate elapsed time to a readable string
        // this logic calls itself recursively
        const updateRetrievedAt = () => {
            // make sure that data exists (implied by non-null value)
            if (retrievedAt) {
                // time elapsed since fetch in ms
                const elapsedTime: number = Date.now() - retrievedAt;
                // logic router to get human-readable string for DOM
                let elapsedText: string;
                if (elapsedTime > ONE_SECOND * 1800) {
                    elapsedText = '> 30 min';
                } else if (elapsedTime >= ONE_SECOND * 60) {
                    elapsedText = calcTime(elapsedTime, 'minutes') + ' min ago';
                } else if (elapsedTime >= ONE_SECOND) {
                    elapsedText = calcTime(elapsedTime, 'seconds') + ' sec ago';
                } else {
                    elapsedText = 'just now';
                }
                // update the DOM with a readable text string
                setTimeSince('updated: ' + elapsedText);
                // call recursively at 15s
                timeoutId.current = setTimeout(
                    updateRetrievedAt,
                    ONE_SECOND * 15,
                );
            } else {
                // re-check data in two seconds if fetch is not yet complete
                timeoutId.current = setTimeout(
                    updateRetrievedAt,
                    ONE_SECOND * 2,
                );
            }
            // logic to convert elapsed time in ms to seconds or minutes
            function calcTime(
                timeInMs: number,
                denom: 'minutes' | 'seconds',
            ): string {
                return Math.floor(
                    timeInMs / (denom === 'minutes' ? 60000 : 1000),
                ).toString();
            }
        };
        // run recursive text-updating fn
        updateRetrievedAt();
        // clear timeout when the component unmounts
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, [retrievedAt]);

    return {
        value: timeSince,
        reset: () => setTimeSince(''),
    };
};

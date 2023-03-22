import { useState } from 'react';

export const useCandleTime = (section: string, defaultTime: number) => {
    console.log('ran hook useCandleTime() in Trade.tsx file!');
    console.log('this instance is for: ' + section);

    const [candleTime, setCandleTime] = useState<number>(defaultTime);

    false && candleTime;
    false && setCandleTime;
};

import { Dispatch, SetStateAction } from 'react';
import { candleDomain } from '../../../utils/state/tradeDataSlice';

export class mobileZoom {
    setCandleDomains: Dispatch<SetStateAction<candleDomain>>;
    period: number;
    previousTouch: number | undefined;
    previousDeltaTouch: number | undefined;
    constructor(
        setCandleDomains: Dispatch<SetStateAction<candleDomain>>,
        period: number,
        previousTouch?: number,
        previousDeltaTouch?: number,
    ) {
        this.setCandleDomains = setCandleDomains;
        this.period = period;
        this.previousTouch = previousTouch;
        this.previousDeltaTouch = previousDeltaTouch;
    }
}

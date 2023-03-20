import { SlippageIF } from './SlippageIF';

export interface SlippagePairIF {
    stable: SlippageIF;
    volatile: SlippageIF;
    presets: {
        stable: number[];
        volatile: number[];
    };
}

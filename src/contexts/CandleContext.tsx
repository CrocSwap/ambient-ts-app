import { createContext, SetStateAction, Dispatch } from 'react';
import { CandlesByPoolAndDuration } from '../utils/state/graphDataSlice';
import { candleDomain, candleScale } from '../utils/state/tradeDataSlice';

interface CandleStateIF {
    candleData: {
        value: CandlesByPoolAndDuration | undefined;
        setValue: Dispatch<
            SetStateAction<CandlesByPoolAndDuration | undefined>
        >;
    };
    isCandleDataNull: {
        value: boolean;
        setValue: Dispatch<SetStateAction<boolean>>;
    };
    isCandleSelected: {
        value: boolean | undefined;
        setValue: Dispatch<SetStateAction<boolean | undefined>>;
    };
    fetchingCandle: {
        value: boolean;
        setValue: Dispatch<SetStateAction<boolean>>;
    };
    candleDomains: {
        value: candleDomain;
        setValue: Dispatch<SetStateAction<candleDomain>>;
    };

    candleScale: {
        value: candleScale;
        setValue: Dispatch<SetStateAction<candleScale>>;
    };
}

export const CandleContext = createContext<CandleStateIF>({} as CandleStateIF);

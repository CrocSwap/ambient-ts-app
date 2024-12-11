import { useOutletContext } from 'react-router-dom';
import { TradeDataContextIF } from '../../ambient-utils/types/contextTypes';
import { updatesIF, validParamsType } from '../../utils/hooks/useUrlParams';

type ContextType = {
    tradeData: TradeDataContextIF;
    limitTickFromParams: number | null;
    urlParamMap: Map<validParamsType, string>;
    updateURL: (changes: updatesIF) => void;
};

export function useTradeData() {
    return useOutletContext<ContextType>();
}

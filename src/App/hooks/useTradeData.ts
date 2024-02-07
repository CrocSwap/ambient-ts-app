import { useOutletContext } from 'react-router-dom';
import { updatesIF, validParamsType } from '../../utils/hooks/useUrlParams';
import { TradeDataContextIF } from '../../contexts/TradeDataContext';

type ContextType = {
    tradeData: TradeDataContextIF;
    limitTickFromParams: number | null;
    urlParamMap: Map<validParamsType, string>;
    updateURL: (changes: updatesIF) => void;
};

export function useTradeData() {
    return useOutletContext<ContextType>();
}

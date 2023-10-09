import { useOutletContext } from 'react-router-dom';
import { TradeDataIF } from '../../utils/state/tradeDataSlice';
import { updatesIF, validParamsType } from '../../utils/hooks/useUrlParams';

type ContextType = {
    tradeData: TradeDataIF;
    navigationMenu: JSX.Element;
    limitTickFromParams: number | null;
    urlParamMap: Map<validParamsType, string>;
    updateURL: (changes: updatesIF) => void;
};

export function useTradeData() {
    return useOutletContext<ContextType>();
}

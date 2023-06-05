import { useOutletContext } from 'react-router-dom';
import { TradeDataIF } from '../../utils/state/tradeDataSlice';

type ContextType = {
    tradeData: TradeDataIF;
    navigationMenu: JSX.Element;
    limitTickFromParams: number | null;
};

export function useTradeData() {
    return useOutletContext<ContextType>();
}

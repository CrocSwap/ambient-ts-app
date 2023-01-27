import { Dispatch, SetStateAction, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TransactionIF } from '../../../../../../utils/interfaces/exports';

export const useClick = (
    tx: TransactionIF,
    setOutsideControl: Dispatch<SetStateAction<boolean>>,
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>,
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>,
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>
): (
    () => void
) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const linkPath = useMemo(() => {
        let locationSlug = '';
        if (tx.entityType === 'swap') {
            locationSlug = '/trade/market';
        } else if (tx.entityType === 'limitOrder') {
            locationSlug = '/trade/limit';
        } else if (tx.entityType === 'liqchange') {
            locationSlug = '/trade/range';
        } else {
            locationSlug = '/trade/market';
        }
        return locationSlug + '/chain=0x5&tokenA=' + tx.base + '&tokenB=' + tx.quote;
    }, [pathname]);

    const handleClick = () => {
        setOutsideControl(true);
        setSelectedOutsideTab(0);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(linkPath);
    }

    return handleClick;
}
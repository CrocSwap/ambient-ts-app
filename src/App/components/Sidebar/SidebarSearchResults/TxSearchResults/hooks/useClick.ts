import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionIF } from '../../../../../../utils/interfaces/exports';

export const useClick = (
    setOutsideControl: Dispatch<SetStateAction<boolean>>,
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>,
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>,
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>,
): ((tx: TransactionIF) => void) => {
    const navigate = useNavigate();

    const handleClick = (tx: TransactionIF) => {
        let locationSlug: string;
        let tabNumber: number;

        switch (tx.entityType) {
            case 'limitOrder':
                locationSlug = '/trade/limit';
                tabNumber = 1;
                break;
            case 'liqchange':
                locationSlug = '/trade/range';
                tabNumber = 2;
                break;
            case 'swap':
            default:
                locationSlug = '/trade/market';
                tabNumber = 0;
                break;
        }

        setOutsideControl(true);
        setSelectedOutsideTab(tabNumber);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(locationSlug + '/chain=0x5&tokenA=' + tx.base + '&tokenB=' + tx.quote);
    };

    return handleClick;
};

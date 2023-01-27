import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { TransactionIF } from '../../../../../../utils/interfaces/exports';

export const useClick = (
    setOutsideControl: Dispatch<SetStateAction<boolean>>,
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>,
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>,
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>
): (
    (tx: TransactionIF) => void
) => {
    const navigate = useNavigate();

    const handleClick = (tx: TransactionIF) => {
        let linkPath: string;

        switch (tx.entityType) {
            case 'limitOrder':
                linkPath = '/trade/limit';
                break;
            case 'liqchange':
                linkPath = '/trade/range';
                break;
            case 'swap':
            default:
                linkPath = '/trade/market';
                break;
        }

        setOutsideControl(true);
        setSelectedOutsideTab(0);
        setIsShowAllEnabled(false);
        setCurrentTxActiveInTransactions(tx.id);
        navigate(linkPath);
    }

    return handleClick;
}
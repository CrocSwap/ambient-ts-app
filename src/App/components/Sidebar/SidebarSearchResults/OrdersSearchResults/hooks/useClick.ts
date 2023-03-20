import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LimitOrderIF } from '../../../../../../utils/interfaces/exports';

export const useClick = (
    setOutsideControl: Dispatch<SetStateAction<boolean>>,
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>,
    setCurrentPositionActive: Dispatch<SetStateAction<string>>,
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>,
): ((limitOrder: LimitOrderIF) => void) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleClick = (limitOrder: LimitOrderIF) => {
        let locationSlug = '';
        if (pathname.startsWith('/trade/market') || pathname.startsWith('/account')) {
            locationSlug = '/trade/market';
        } else if (pathname.startsWith('/trade/limit')) {
            locationSlug = '/trade/limit';
        } else if (pathname.startsWith('/trade/range')) {
            locationSlug = '/trade/range';
        } else if (pathname.startsWith('/swap')) {
            locationSlug = '/swap';
        }
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentPositionActive(limitOrder.limitOrderIdentifier);
        setIsShowAllEnabled(false);
        navigate(
            locationSlug + '/chain=0x5&tokenA=' + limitOrder.base + '&tokenB=' + limitOrder.quote,
        );
    };

    return handleClick;
};

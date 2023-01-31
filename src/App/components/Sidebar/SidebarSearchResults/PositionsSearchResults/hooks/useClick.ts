import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PositionIF } from '../../../../../../utils/interfaces/exports';

export const useClick = (
    setOutsideControl: Dispatch<SetStateAction<boolean>>,
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>,
    setCurrentPositionActive: Dispatch<SetStateAction<string>>,
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>,
): ((position: PositionIF) => void) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    function handleClick(position: PositionIF) {
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
        setSelectedOutsideTab(2);
        setCurrentPositionActive(position.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(locationSlug + '/chain=0x5&tokenA=' + position.base + '&tokenB=' + position.quote);
    }
    return handleClick;
};

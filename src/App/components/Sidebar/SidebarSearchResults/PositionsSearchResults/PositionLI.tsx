import { Dispatch, SetStateAction, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { getRangeDisplay } from './functions/getRangeDisplay'
import { getValueUSD } from './functions/getValueUSD';

interface propsIF {
    position: PositionIF;
    isDenomBase: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function PositionLI(props: propsIF) {
    const {
        position,
        isDenomBase,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const { pathname } = useLocation();
    const navigate = useNavigate();

    const linkPath = useMemo<string>(() => {
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
        return locationSlug + '/chain=0x5&tokenA=' + position.base + '&tokenB=' + position.quote;
    }, [pathname]);

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(2);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(linkPath);
    }

    const rangeDisplay = getRangeDisplay(position, isDenomBase);

    const positionValue = getValueUSD(position.totalValueUSD);

    return (
        <div className={styles.card_container} onClick={() => handleRangePositionClick(position)}>
            <div>
                {isDenomBase
                    ? `${position?.baseSymbol} / ${position?.quoteSymbol}`
                    : `${position?.quoteSymbol} / ${position?.baseSymbol}`}
            </div>
            <div>{rangeDisplay}</div>
            <div>{'$' + positionValue}</div>
        </div>
    );
}

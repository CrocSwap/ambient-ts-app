import styles from './SidebarRangePositionsCard.module.css';
import { PositionIF, TokenIF } from '../../../../utils/interfaces/exports';
import { useMemo, SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPositionValue } from './functions/getPositionValue';
import { getSymbols } from './functions/getSymbols';
import { getRangeDisplay } from './functions/getRangeDisplay';

interface propsIF {
    isDenomBase: boolean;
    position: PositionIF;
    tokenMap: Map<string, TokenIF>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    tabToSwitchToBasedOnRoute: number;
}

export default function SidebarRangePositionsCard(props: propsIF) {
    const {
        isDenomBase,
        position,
        setOutsideControl,
        setSelectedOutsideTab,
        setCurrentPositionActive,
        setIsShowAllEnabled,
        tabToSwitchToBasedOnRoute,
    } = props;

    const { pathname } = useLocation();

    const linkPath = useMemo(() => {
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

    const navigate = useNavigate();

    function handleRangePositionClick(pos: PositionIF) {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        navigate(linkPath);
    }

    // human-readable string showing the tokens in the pool
    const pair = getSymbols(isDenomBase, position.baseSymbol, position.quoteSymbol);

    // human-readable string indicating the range display
    const [rangeDisplay, rangeStatusStyle] = getRangeDisplay(position, isDenomBase);

    // human-readable string showing total value of the position
    const value = getPositionValue(position.totalValueUSD);

    return (
        <div className={styles.container} onClick={() => handleRangePositionClick(position)}>
            <div>{pair}</div>
            <div>
                {rangeDisplay}
                <div className={styles.range_status_container}>
                    <div className={rangeStatusStyle}>
                        <div className={styles.inner_circle_2}></div>
                    </div>
                </div>
            </div>
            <div className={styles.status_display}>{value}</div>
        </div>
    );
}

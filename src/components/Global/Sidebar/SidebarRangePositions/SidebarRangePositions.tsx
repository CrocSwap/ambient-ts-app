import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/exports';
import { SetStateAction, Dispatch, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useUrlPath } from '../../../../utils/hooks/useUrlPath';

interface propsIF {
    chainId: string;
    isDenomBase: boolean;
    userPositions?: PositionIF[];
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    isUserLoggedIn: boolean | undefined;
}

export default function SidebarRangePositions(props: propsIF) {
    const {
        chainId,
        isDenomBase,
        userPositions,
        setCurrentPositionActive,
        isUserLoggedIn,
        setIsShowAllEnabled,
    } = props;

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
        sidebar: { close: closeSidebar },
    } = useContext(AppStateContext);

    const location = useLocation();
    const navigate = useNavigate();
    const linkGenRange = useUrlPath('range');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 2 : onAccountRoute ? 2 : 2;

    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        navigate('/account');
    }

    const handleRangePositionClick = (pos: PositionIF): void => {
        setOutsideControlActive(true);
        setOutsideTabSelected(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.positionStorageSlot);
        setIsShowAllEnabled(false);
        linkGenRange.navigate({
            chain: chainId,
            tokenA: pos.base,
            tokenB: pos.quote
        });
    };

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        setOutsideControlActive(true);
        setOutsideTabSelected(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Range</div>
                <div>Value</div>
            </header>
            <div className={styles.content}>
                {userPositions &&
                    userPositions.map((position, idx) => (
                        <SidebarRangePositionsCard
                            key={idx}
                            position={position}
                            isDenomBase={isDenomBase}
                            handleClick={handleRangePositionClick}
                        />
                    ))}
            </div>
            {isUserLoggedIn && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}

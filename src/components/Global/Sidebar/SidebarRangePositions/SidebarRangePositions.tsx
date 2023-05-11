import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/exports';
import { SetStateAction, Dispatch, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    chainId: string;
    isDenomBase: boolean;
    userPositions?: PositionIF[];
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarRangePositions(props: propsIF) {
    const {
        chainId,
        isDenomBase,
        userPositions,
        setCurrentPositionActive,
        setIsShowAllEnabled,
    } = props;

    const {
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
        sidebar: { close: closeSidebar },
    } = useContext(AppStateContext);
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const location = useLocation();
    const navigate = useNavigate();

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
        navigate(
            '/trade/range/chain=' +
                chainId +
                '&tokenA=' +
                pos.base +
                '&tokenB=' +
                pos.quote,
        );
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
            {isUserConnected && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}

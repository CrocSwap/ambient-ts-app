import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/exports';
import { SetStateAction, Dispatch } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface propsIF {
    chainId: string;
    isDenomBase: boolean;
    userPositions?: PositionIF[];
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    isUserLoggedIn: boolean | undefined;
    closeSidebar: () => void;
}

export default function SidebarRangePositions(props: propsIF) {
    const {
        chainId,
        isDenomBase,
        userPositions,
        setCurrentPositionActive,
        isUserLoggedIn,
        closeSidebar,
        setOutsideControl,
        setSelectedOutsideTab,
        setIsShowAllEnabled,
    } = props;

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
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
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
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
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

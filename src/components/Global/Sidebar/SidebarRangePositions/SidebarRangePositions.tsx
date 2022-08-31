import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { SetStateAction, Dispatch } from 'react';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarRangeProps {
    isDenomBase: boolean;
    userPositions?: PositionIF[];
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;

    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;

    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarRangePositions(props: SidebarRangeProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        tokenMap,
        isDenomBase,
        userPositions,
        currentPositionActive,
        setCurrentPositionActive,
        expandTradeTable,
    } = props;

    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Range</div>
            <div>Value</div>
        </div>
    );

    // const mapItems = [1, 2, 3, 4, 5, 6, 7];

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 2 : onAccountRoute ? 2 : 0;

    function redirectBasedOnRoute() {
        if (onTradeRoute || onAccountRoute) return;
        navigate('/trade');
    }

    const handleViewMoreClick = () => {
        props.setOutsideControl(true);
        props.setSelectedOutsideTab(2);
        redirectBasedOnRoute();

        props.setIsShowAllEnabled(true);
        props.setExpandTradeTable(true);
    };

    const sidebarRangePositionCardProps = {
        tokenMap: tokenMap,
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,
        isShowAllEnabled: props.isShowAllEnabled,
        setIsShowAllEnabled: props.setIsShowAllEnabled,

        tabToSwitchToBasedOnRoute: tabToSwitchToBasedOnRoute,
    };

    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {userPositions &&
                    userPositions.map((position, idx) => (
                        <SidebarRangePositionsCard
                            key={idx}
                            position={position}
                            isDenomBase={isDenomBase}
                            {...sidebarRangePositionCardProps}
                        />
                    ))}
            </div>
            {!expandTradeTable && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}

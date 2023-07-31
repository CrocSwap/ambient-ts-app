import styles from '../SidebarTable.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
import { PositionIF } from '../../../../utils/interfaces/exports';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { useContext } from 'react';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';

interface propsIF {
    userPositions?: PositionIF[];
}

export default function SidebarRangePositions(props: propsIF) {
    const { userPositions } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        setCurrentPositionActive,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);
    const {
        sidebar: { close: closeSidebar },
    } = useContext(SidebarContext);
    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const location = useLocation();

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const linkGenAccount: linkGenMethodsIF = useLinkGen('account');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 2 : onAccountRoute ? 2 : 2;

    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        linkGenAccount.navigate();
    }

    const handleRangePositionClick = (pos: PositionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setCurrentPositionActive(pos.firstMintTx);
        setShowAllData(false);
        linkGenPool.navigate({
            chain: chainId,
            tokenA: pos.base,
            tokenB: pos.quote,
        });
    };

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.range_header}>
                <div>Pool</div>
                <div>Range</div>
                <div>Value</div>
                <div />
            </header>
            <div className={styles.content}>
                {userPositions &&
                    userPositions.map((position, idx) => (
                        <SidebarRangePositionsCard
                            key={idx}
                            position={position}
                            handleClick={handleRangePositionClick}
                        />
                    ))}
                {isUserConnected && (
                    <div
                        className={styles.view_more}
                        onClick={handleViewMoreClick}
                    >
                        View More
                    </div>
                )}
            </div>
        </div>
    );
}

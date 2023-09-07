import SidebarLimitOrdersCard from './SidebarLimitOrdersCard';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { LimitOrderIF } from '../../../../utils/interfaces/exports';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { FlexContainer } from '../../../../styled/Common';
import {
    HeaderGrid,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../../styled/Components/Sidebar';

interface propsIF {
    limitOrderByUser?: LimitOrderIF[];
}

export default function SidebarLimitOrders(props: propsIF) {
    const { limitOrderByUser } = props;

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

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

    const location = useLocation();

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenAccount: linkGenMethodsIF = useLinkGen('account');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 1 : onAccountRoute ? 1 : 1;
    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        linkGenAccount.navigate();
    }

    const handleLimitOrderClick = (limitOrder: LimitOrderIF) => {
        setOutsideControl(true);
        setSelectedOutsideTab(1);
        setCurrentPositionActive(limitOrder.limitOrderId);
        setShowAllData(false);
        linkGenLimit.navigate({
            chain: chainId,
            tokenA: limitOrder.base,
            tokenB: limitOrder.quote,
            limitTick: '10',
        });
    };

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <FlexContainer flexDirection='column' fontSize='body' fullHeight>
            <HeaderGrid numCols={3} color='text2' padding='4px 0'>
                {['Pool', 'Price', 'Value'].map((item) => (
                    <FlexContainer key={item} justifyContent='center'>
                        {item}
                    </FlexContainer>
                ))}
            </HeaderGrid>
            <ItemsContainer>
                {limitOrderByUser &&
                    limitOrderByUser.map((order: LimitOrderIF) => (
                        <SidebarLimitOrdersCard
                            key={
                                'Sidebar-Limit-Orders-Card-' +
                                JSON.stringify(order)
                            }
                            order={order}
                            handleClick={handleLimitOrderClick}
                        />
                    ))}
                {isUserConnected && (
                    <ViewMoreFlex
                        justifyContent='center'
                        color='accent4'
                        onClick={handleViewMoreClick}
                    >
                        View More
                    </ViewMoreFlex>
                )}
            </ItemsContainer>
        </FlexContainer>
    );
}

import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { PositionIF } from '../../../../ambient-utils/types';
import { AppStateContext } from '../../../../contexts';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    ItemsContainer,
    RangeHeaderGrid,
    ViewMoreFlex,
} from '../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    poolParamsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';

interface propsIF {
    userPositions?: PositionIF[];
}

export default function SidebarRangePositions(props: propsIF) {
    const { userPositions } = props;

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        setCurrentPositionActive,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);
    const {
        sidebar: { close: closeSidebar },
    } = useContext(SidebarContext);
    const { isUserConnected } = useContext(UserDataContext);

    const { tokenA } = useContext(TradeDataContext);

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
        setCurrentPositionActive(pos.positionId);
        setShowAllData(false);
        // URL params for link to pool page
        const poolLinkParams: poolParamsIF = {
            chain: chainId,
            tokenA:
                tokenA.address.toLowerCase() === pos.base.toLowerCase()
                    ? pos.base
                    : pos.quote,
            tokenB:
                tokenA.address.toLowerCase() === pos.base.toLowerCase()
                    ? pos.quote
                    : pos.base,
        };
        // navigate user to pool page with URL params defined above
        linkGenPool.navigate(poolLinkParams);
    };

    const handleViewMoreClick = () => {
        redirectBasedOnRoute();
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <FlexContainer flexDirection='column' fontSize='body' fullHeight>
            <RangeHeaderGrid color='text2' padding='4px 0'>
                {['Pool', 'Range', 'Value', ''].map((item) => (
                    <FlexContainer key={item} justifyContent='center'>
                        {item}
                    </FlexContainer>
                ))}
            </RangeHeaderGrid>
            <ItemsContainer>
                {userPositions &&
                    userPositions.map((position, idx) => (
                        <SidebarRangePositionsCard
                            key={idx}
                            position={position}
                            handleClick={handleRangePositionClick}
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

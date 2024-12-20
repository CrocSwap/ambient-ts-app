import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

import { TransactionIF } from '../../../../ambient-utils/types';

import { AppStateContext } from '../../../../contexts';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    HeaderGrid,
    ItemsContainer,
    ViewMoreFlex,
} from '../../../../styled/Components/Sidebar';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';

interface propsIF {
    mostRecentTransactions: TransactionIF[];
}

export default function SidebarRecentTransactions(props: propsIF) {
    const { mostRecentTransactions } = props;

    const { isUserConnected } = useContext(UserDataContext);

    const { tokenA } = useContext(TradeDataContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const {
        setCurrentTxActiveInTransactions,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);
    const {
        sidebar: { close: closeSidebar },
    } = useContext(SidebarContext);

    const location = useLocation();

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenAccount: linkGenMethodsIF = useLinkGen('account');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 0 : 0;

    // TODO: should this redirect with a <Navigate /> element?
    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        linkGenAccount.navigate();
    }

    const handleCardClick = (tx: TransactionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setShowAllData(false);
        setCurrentTxActiveInTransactions(tx.txId);
        linkGenMarket.navigate(
            tokenA.address.toLowerCase() === tx.base.toLowerCase()
                ? {
                      chain: chainId,
                      tokenA: tx.base,
                      tokenB: tx.quote,
                  }
                : {
                      chain: chainId,
                      tokenA: tx.quote,
                      tokenB: tx.base,
                  },
        );
    };

    const handleViewMoreClick = (): void => {
        redirectBasedOnRoute();
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <FlexContainer flexDirection='column' fontSize='body' fullHeight>
            <HeaderGrid color='text2' padding='4px 0'>
                {['Pair', 'Type', 'Value'].map((item) => (
                    <FlexContainer key={item} justifyContent='center'>
                        {item}
                    </FlexContainer>
                ))}
            </HeaderGrid>
            <ItemsContainer>
                {mostRecentTransactions.map((tx: TransactionIF) => (
                    <SidebarRecentTransactionsCard
                        key={
                            'Sidebar-Recent-Transactions-Card-' +
                            JSON.stringify(tx)
                        }
                        tx={tx}
                        handleClick={handleCardClick}
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

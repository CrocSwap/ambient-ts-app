import React, { useEffect } from 'react';
import { AppStateContextProvider } from './AppStateContext';
import { CachedDataContextProvider } from './CachedDataContext';
import { CandleContextProvider } from './CandleContext';
import { ChainDataContextProvider } from './ChainDataContext';
import { ChartContextProvider } from './ChartContext';
import { CrocEnvContextProvider } from './CrocEnvContext';
import { PoolContextProvider } from './PoolContext';
import { RangeContextProvider } from './RangeContext';
import { SidebarContextProvider } from './SidebarContext';
import { TokenContextProvider } from './TokenContext';
import { TradeTableContextProvider } from './TradeTableContext';
import { TradeTokenContextProvider } from './TradeTokenContext';
import { UserDataContextProvider } from './UserDataContext';
import { UserPreferenceContextProvider } from './UserPreferenceContext';
import { ExploreContextProvider } from './ExploreContext';
import { GraphDataContextProvider } from './GraphDataContext';
import { DataLoadingContextProvider } from './DataLoadingContext';
import { TokenBalanceContextProvider } from './TokenBalanceContext';
import { TradeDataContextProvider } from './TradeDataContext';
import { cleanupBatchManager } from '../ambient-utils/api';
import { ReceiptContextProvider } from './ReceiptContext';
import { XpLeadersContextProvider } from './XpLeadersContext';

export const GlobalContexts = (props: { children: React.ReactNode }) => {
    useEffect(() => {
        return () => {
            (async () => await cleanupBatchManager())();
        };
    }, []);

    return (
        <AppStateContextProvider>
            <CachedDataContextProvider>
                <DataLoadingContextProvider>
                    <UserDataContextProvider>
                        <ReceiptContextProvider>
                            <RangeContextProvider>
                                <TradeDataContextProvider>
                                    {/* Everything above here has no context dependencies */}
                                    <TokenBalanceContextProvider>
                                        <CrocEnvContextProvider>
                                            <TokenContextProvider>
                                                <ChainDataContextProvider>
                                                    <XpLeadersContextProvider>
                                                        <ChartContextProvider>
                                                            <GraphDataContextProvider>
                                                                <TradeTokenContextProvider>
                                                                    <PoolContextProvider>
                                                                        <CandleContextProvider>
                                                                            <TradeTableContextProvider>
                                                                                <UserPreferenceContextProvider>
                                                                                    <SidebarContextProvider>
                                                                                        <ExploreContextProvider>
                                                                                            {
                                                                                                props.children
                                                                                            }
                                                                                        </ExploreContextProvider>
                                                                                    </SidebarContextProvider>
                                                                                </UserPreferenceContextProvider>
                                                                            </TradeTableContextProvider>
                                                                        </CandleContextProvider>
                                                                    </PoolContextProvider>
                                                                </TradeTokenContextProvider>
                                                            </GraphDataContextProvider>
                                                        </ChartContextProvider>
                                                    </XpLeadersContextProvider>
                                                </ChainDataContextProvider>
                                            </TokenContextProvider>
                                        </CrocEnvContextProvider>
                                    </TokenBalanceContextProvider>
                                    {/* Everything below here has no context dependencies */}
                                </TradeDataContextProvider>
                            </RangeContextProvider>
                        </ReceiptContextProvider>
                    </UserDataContextProvider>
                </DataLoadingContextProvider>
            </CachedDataContextProvider>
        </AppStateContextProvider>
    );
};

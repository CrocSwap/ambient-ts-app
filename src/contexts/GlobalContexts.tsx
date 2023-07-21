import React from 'react';
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

export const GlobalContexts = (props: { children: React.ReactNode }) => {
    return (
        <AppStateContextProvider>
            <CachedDataContextProvider>
                <CrocEnvContextProvider>
                    <TokenContextProvider>
                        <ChainDataContextProvider>
                            <UserDataContextProvider>
                                <ChartContextProvider>
                                    <RangeContextProvider>
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
                                    </RangeContextProvider>
                                </ChartContextProvider>
                            </UserDataContextProvider>
                        </ChainDataContextProvider>
                    </TokenContextProvider>
                </CrocEnvContextProvider>
            </CachedDataContextProvider>
        </AppStateContextProvider>
    );
};

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
import { ENSAddressContextProvider } from './ENSAddressContext';
import { GraphDataContextProvider } from './GraphDataContext';
import { DataLoadingContextProvider } from './DataLoadingContext';

export const GlobalContexts = (props: { children: React.ReactNode }) => {
    return (
        <AppStateContextProvider>
            <ENSAddressContextProvider>
                <CachedDataContextProvider>
                    <DataLoadingContextProvider>
                        <UserDataContextProvider>
                            <CrocEnvContextProvider>
                                <TokenContextProvider>
                                    <ChainDataContextProvider>
                                        <GraphDataContextProvider>
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
                                        </GraphDataContextProvider>
                                    </ChainDataContextProvider>
                                </TokenContextProvider>
                            </CrocEnvContextProvider>
                        </UserDataContextProvider>
                    </DataLoadingContextProvider>
                </CachedDataContextProvider>
            </ENSAddressContextProvider>
        </AppStateContextProvider>
    );
};

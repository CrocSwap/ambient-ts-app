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

export const GlobalContexts = (props: { children: React.ReactNode }) => {
    return (
        <AppStateContextProvider>
            <CachedDataContextProvider>
                <CrocEnvContextProvider>
                    <UserDataContextProvider>
                        <TokenContextProvider>
                            <ChainDataContextProvider>
                                <ChartContextProvider>
                                    <RangeContextProvider>
                                        <TradeTokenContextProvider>
                                            <PoolContextProvider>
                                                <TradeTableContextProvider>
                                                    <CandleContextProvider>
                                                        <UserPreferenceContextProvider>
                                                            <SidebarContextProvider>
                                                                {props.children}
                                                            </SidebarContextProvider>
                                                        </UserPreferenceContextProvider>
                                                    </CandleContextProvider>
                                                </TradeTableContextProvider>
                                            </PoolContextProvider>
                                        </TradeTokenContextProvider>
                                    </RangeContextProvider>
                                </ChartContextProvider>
                            </ChainDataContextProvider>
                        </TokenContextProvider>
                    </UserDataContextProvider>
                </CrocEnvContextProvider>
            </CachedDataContextProvider>
        </AppStateContextProvider>
    );
};

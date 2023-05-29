import React from 'react';
import { AppStateContextProvider } from './AppStateContext';
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
                                                            {props.children}
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
        </AppStateContextProvider>
    );
};

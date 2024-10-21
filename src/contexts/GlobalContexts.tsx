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
import { BrandContextProvider } from './BrandContext';
import { AuctionsContextProvider } from './AuctionsContext';
import { FutaSearchableTickerContextProvider } from './Futa/FutaSearchableTickerContext';
import { FutaHomeContextProvider } from './Futa/FutaHomeContext';

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
                                {/* Everything above here has no context dependencies */}
                                <TokenBalanceContextProvider>
                                    <TokenContextProvider>
                                        <TradeDataContextProvider>
                                            <BrandContextProvider>
                                                <CrocEnvContextProvider>
                                                    <ChainDataContextProvider>
                                                        <AuctionsContextProvider>
                                                            <XpLeadersContextProvider>
                                                                <ChartContextProvider>
                                                                    <FutaSearchableTickerContextProvider>
                                                                        <FutaHomeContextProvider>
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
                                                                        </FutaHomeContextProvider>
                                                                    </FutaSearchableTickerContextProvider>
                                                                </ChartContextProvider>
                                                            </XpLeadersContextProvider>
                                                        </AuctionsContextProvider>
                                                    </ChainDataContextProvider>
                                                </CrocEnvContextProvider>
                                            </BrandContextProvider>
                                        </TradeDataContextProvider>
                                    </TokenContextProvider>
                                </TokenBalanceContextProvider>
                                {/* Everything below here has no context dependencies */}
                            </RangeContextProvider>
                        </ReceiptContextProvider>
                    </UserDataContextProvider>
                </DataLoadingContextProvider>
            </CachedDataContextProvider>
        </AppStateContextProvider>
    );
};

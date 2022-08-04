import { createReducer } from '@reduxjs/toolkit';
import { SupportedNetwork } from '../../constants/networks';
import { currentTimestamp } from './../../utils/index';
import {
    addPoolKeys,
    updatePoolChartData,
    updatePoolData,
    updatePoolTransactions,
    updateTickData,
} from './actions';
import { PoolsState } from './models';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const initialState: PoolsState = {
    byAddress: {
        [SupportedNetwork.ETHEREUM]: {},
        [SupportedNetwork.ARBITRUM]: {},
        [SupportedNetwork.OPTIMISM]: {},
        [SupportedNetwork.POLYGON]: {},
    },
};

export default createReducer(initialState, (builder) =>
    builder
        .addCase(updatePoolData, (state, { payload: { pools, networkId } }) => {
            pools.map(
                (poolData) =>
                    (state.byAddress[networkId][poolData.address] = {
                        ...state.byAddress[networkId][poolData.address],
                        data: poolData,
                        lastUpdated: currentTimestamp(),
                    }),
            );
        })
        // add address to byAddress keys if not included yet
        .addCase(addPoolKeys, (state, { payload: { poolAddresses, networkId } }) => {
            poolAddresses.map((address) => {
                if (!state.byAddress[networkId][address]) {
                    state.byAddress[networkId][address] = {
                        data: undefined,
                        chartData: undefined,
                        transactions: undefined,
                        lastUpdated: undefined,
                        tickData: undefined,
                    };
                }
            });
        })
        .addCase(
            updatePoolChartData,
            (state, { payload: { poolAddress, chartData, networkId } }) => {
                state.byAddress[networkId][poolAddress] = {
                    ...state.byAddress[networkId][poolAddress],
                    chartData: chartData,
                };
            },
        )
        .addCase(
            updatePoolTransactions,
            (state, { payload: { poolAddress, transactions, networkId } }) => {
                state.byAddress[networkId][poolAddress] = {
                    ...state.byAddress[networkId][poolAddress],
                    transactions,
                };
            },
        )
        .addCase(updateTickData, (state, { payload: { poolAddress, tickData, networkId } }) => {
            state.byAddress[networkId][poolAddress] = {
                ...state.byAddress[networkId][poolAddress],
                tickData,
            };
        }),
);

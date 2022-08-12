import { createReducer } from '@reduxjs/toolkit';
import { SupportedNetwork } from '../../constants/networks';
import { currentTimestamp } from './../../utils/index';
import { updateChartData, updateProtocolData, updateTransactions } from './actions';
import { ProtocolState } from './models';

export const initialState: ProtocolState = {
    [SupportedNetwork.ETHEREUM]: {
        data: undefined,
        chartData: undefined,
        transactions: undefined,
        lastUpdated: undefined,
    },
    [SupportedNetwork.ARBITRUM]: {
        data: undefined,
        chartData: undefined,
        transactions: undefined,
        lastUpdated: undefined,
    },
    [SupportedNetwork.OPTIMISM]: {
        data: undefined,
        chartData: undefined,
        transactions: undefined,
        lastUpdated: undefined,
    },
    [SupportedNetwork.POLYGON]: {
        data: undefined,
        chartData: undefined,
        transactions: undefined,
        lastUpdated: undefined,
    },
};

export default createReducer(initialState, (builder) =>
    builder
        .addCase(updateProtocolData, (state, { payload: { protocolData, networkId } }) => {
            state[networkId].data = protocolData;
            // mark when last updated
            state[networkId].lastUpdated = currentTimestamp();
        })
        .addCase(updateChartData, (state, { payload: { chartData, networkId } }) => {
            state[networkId].chartData = chartData;
        })
        .addCase(updateTransactions, (state, { payload: { transactions, networkId } }) => {
            state[networkId].transactions = transactions;
        }),
);

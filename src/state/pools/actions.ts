import { createAction } from '@reduxjs/toolkit';
import { SupportedNetwork } from '../../constants/networks';
import { TickProcessed } from '../../data/pools/tickData';
import { Transaction } from '../../types';
import { PoolData, PoolChartEntry } from './models';

// protocol wide info
export const updatePoolData = createAction<{ pools: PoolData[]; networkId: SupportedNetwork }>(
    'pools/updatePoolData',
);

// add pool address to byAddress
export const addPoolKeys = createAction<{ poolAddresses: string[]; networkId: SupportedNetwork }>(
    'pool/addPoolKeys',
);

export const updatePoolChartData = createAction<{
    poolAddress: string;
    chartData: PoolChartEntry[];
    networkId: SupportedNetwork;
}>('pool/updatePoolChartData');

export const updatePoolTransactions = createAction<{
    poolAddress: string;
    transactions: Transaction[];
    networkId: SupportedNetwork;
}>('pool/updatePoolTransactions');

export const updateTickData = createAction<{
    poolAddress: string;
    tickData:
        | {
              ticksProcessed: TickProcessed[];
              feeTier: string;
              tickSpacing: number;
              activeTickIdx: number;
          }
        | undefined;
    networkId: SupportedNetwork;
}>('pool/updateTickData');

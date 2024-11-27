import { MAX_TICK, MIN_TICK } from '@crocswap-libs/sdk';

export const pinTickToTickLower = (poolPriceTick: number, gridSize: number) => {
    const tickGrid = Math.floor(poolPriceTick / gridSize) * gridSize;
    const horizon = Math.floor(MIN_TICK / gridSize) * gridSize;

    const lowTickNoGoZone = Math.max(tickGrid, horizon);

    return lowTickNoGoZone;
};
export const pinTickToTickUpper = (poolPriceTick: number, gridSize: number) => {
    const tickGrid = Math.ceil(poolPriceTick / gridSize) * gridSize;
    const horizon = Math.ceil(MAX_TICK / gridSize) * gridSize;

    const highTickNoGoZone = Math.min(tickGrid, horizon);

    return highTickNoGoZone;
};

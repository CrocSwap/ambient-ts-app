import { topPools } from '../mockData';

export const useTopPools = () => {
    console.log({topPools});

    return {
        all: topPools
    };
};
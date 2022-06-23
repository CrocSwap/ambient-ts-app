import { configureStore } from '@reduxjs/toolkit';
import tradeDataReducer from './tradeDataSlice';
import graphDataReducer from './graphDataSlice';
import tokens from '../../state/tokens/reducer';
import pools from '../../state/pools/reducer';
import protocol from '../../state/protocol/reducer';

export const store = configureStore({
    reducer: {
        tradeData: tradeDataReducer,
        graphData: graphDataReducer,
        tokens,
        pools,
        protocol,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

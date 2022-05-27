import { configureStore } from '@reduxjs/toolkit';
import tradeDataReducer from './tradeDataSlice';
import rangeDataReducer from './rangeDataSlice';
import graphDataReducer from './graphDataSlice';

export const store = configureStore({
    reducer: {
        tradeData: tradeDataReducer,
        rangeData: rangeDataReducer,
        graphData: graphDataReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

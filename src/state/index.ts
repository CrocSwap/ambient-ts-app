import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';

import application from './application/reducer';
import { updateVersion } from './global/actions';

import tokens from './tokens/reducer';
import pools from './pools/reducer';
import protocol from './protocol/reducer';

const PERSISTED_KEYS: string[] = ['user', 'lists'];

const store = configureStore({
    reducer: {
        application,
        tokens,
        pools,
        protocol,
    },
    middleware: [
        ...getDefaultMiddleware({ thunk: false, immutableCheck: false }),
        save({ states: PERSISTED_KEYS }),
    ],
    preloadedState: load({ states: PERSISTED_KEYS }),
});

store.dispatch(updateVersion());

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

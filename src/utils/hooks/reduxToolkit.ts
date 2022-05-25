// the code below is boilerplate code copied directly from RTK documentation
// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-typed-hooks

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../state/store';

// use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

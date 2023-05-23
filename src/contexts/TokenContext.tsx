import { createContext } from 'react';
import { tokenMethodsIF } from '../App/hooks/useTokens';

export const TokenContext = createContext<tokenMethodsIF>({} as tokenMethodsIF);

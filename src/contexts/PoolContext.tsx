import { CrocPoolView } from '@crocswap-libs/sdk';
import { createContext } from 'react';

export const PoolContext = createContext<CrocPoolView | undefined>(undefined);

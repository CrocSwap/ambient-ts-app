import { CrocEnv } from '@crocswap-libs/sdk';
import { createContext } from 'react';

export const CrocEnvContext = createContext<CrocEnv | undefined>(undefined);

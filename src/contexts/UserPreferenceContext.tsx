import { createContext, PropsWithChildren, useState } from 'react';
import {
    dexBalanceMethodsIF,
    useExchangePrefs,
} from '../App/hooks/useExchangePrefs';
import { favePoolsMethodsIF, useFavePools } from '../App/hooks/useFavePools';
import { skipConfirmIF, useSkipConfirm } from '../App/hooks/useSkipConfirm';
import { slippage } from '../utils/data/slippage';
import { SlippageMethodsIF, useSlippage } from '../App/hooks/useSlippage';

interface UserPreferenceIF {
    favePools: favePoolsMethodsIF;
    swapSlippage: SlippageMethodsIF;
    mintSlippage: SlippageMethodsIF;
    repoSlippage: SlippageMethodsIF;
    dexBalSwap: dexBalanceMethodsIF;
    dexBalLimit: dexBalanceMethodsIF;
    dexBalRange: dexBalanceMethodsIF;
    bypassConfirmSwap: skipConfirmIF;
    bypassConfirmLimit: skipConfirmIF;
    bypassConfirmRange: skipConfirmIF;
    bypassConfirmRepo: skipConfirmIF;
}

export const UserPreferenceContext = createContext<UserPreferenceIF>(
    {} as UserPreferenceIF,
);

import { createContext } from 'react';
import { dexBalanceMethodsIF } from '../App/hooks/useExchangePrefs';
import { favePoolsMethodsIF } from '../App/hooks/useFavePools';
import { skipConfirmIF } from '../App/hooks/useSkipConfirm';
import { SlippageMethodsIF } from '../App/hooks/useSlippage';

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

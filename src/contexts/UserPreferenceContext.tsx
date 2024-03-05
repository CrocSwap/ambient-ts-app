import React, { createContext, useContext, useEffect, useMemo } from 'react';
import {
    dexBalanceMethodsIF,
    useExchangePrefs,
} from '../App/hooks/useExchangePrefs';
import { favePoolsMethodsIF, useFavePools } from '../App/hooks/useFavePools';
import { skipConfirmIF, useSkipConfirm } from '../App/hooks/useSkipConfirm';
import { SlippageMethodsIF, useSlippage } from '../App/hooks/useSlippage';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';
import { TradeDataContext } from './TradeDataContext';
import { getMoneynessRankByAddr } from '../ambient-utils/dataLayer';

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

export const UserPreferenceContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        baseToken: { address: baseTokenAddress },
        quoteToken: { address: quoteTokenAddress },
    } = useContext(TradeTokenContext);

    const { tokenA, tokenB, setDenomInBase, isDenomBase, didUserFlipDenom } =
        useContext(TradeDataContext);

    const userPreferencesProps = {
        favePools: useFavePools(),
        swapSlippage: useSlippage('swap'),
        mintSlippage: useSlippage('mint'),
        repoSlippage: useSlippage('repo'),
        dexBalSwap: useExchangePrefs('swap'),
        dexBalLimit: useExchangePrefs('limit'),
        dexBalRange: useExchangePrefs('range'),
        bypassConfirmSwap: useSkipConfirm('swap'),
        bypassConfirmLimit: useSkipConfirm('limit'),
        bypassConfirmRange: useSkipConfirm('range'),
        bypassConfirmRepo: useSkipConfirm('repo'),
    };

    // Memoize the object being passed to context. This assumes that all of the individual top-level values
    // in the userPreferencesProps object are themselves correctly memo-ized at the object level. E.g. the
    // value from `useSlippage()` or `useSkipConfirm()` should be a new object reference if and only if their
    // content needs to be updated
    const userPreferences = useMemo(
        () => userPreferencesProps,
        [...Object.values(userPreferencesProps)],
    );

    const isBaseTokenMoneynessGreaterOrEqual: boolean = useMemo(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            return (
                getMoneynessRankByAddr(baseTokenAddress) -
                    getMoneynessRankByAddr(quoteTokenAddress) >=
                0
            );
        }
        return false;
    }, [baseTokenAddress, quoteTokenAddress, chainId]);

    function updateDenomIsInBase() {
        // we need to know if the denom token is base or quote
        // currently the denom token is the cheaper one by default
        // ergo we need to know if the cheaper token is base or quote
        // whether pool price is greater or less than 1 indicates which is more expensive
        // if pool price is < 0.1 then denom token will be quote (cheaper one)
        // if pool price is > 0.1 then denom token will be base (also cheaper one)
        // then reverse if didUserToggleDenom === true

        const _isDenomInBase = isBaseTokenMoneynessGreaterOrEqual
            ? didUserFlipDenom
            : !didUserFlipDenom;

        return _isDenomInBase;
    }
    useEffect(() => {
        const _isDenomBase = updateDenomIsInBase();
        if (_isDenomBase !== undefined) {
            if (isDenomBase !== _isDenomBase) {
                IS_LOCAL_ENV && console.debug('denomination changed');
                setDenomInBase(_isDenomBase);
            }
        }
    }, [
        didUserFlipDenom,
        tokenA.address,
        tokenA.chainId,
        tokenB.address,
        tokenB.chainId,
        isBaseTokenMoneynessGreaterOrEqual,
    ]);
    /* ------------------------------------------ END USER PREFERENCES CONTEXT ------------------------------------------ */

    return (
        <UserPreferenceContext.Provider value={userPreferences}>
            {props.children}
        </UserPreferenceContext.Provider>
    );
};

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
    dexBalanceMethodsIF,
    useExchangePrefs,
} from '../App/hooks/useExchangePrefs';
import { favePoolsMethodsIF, useFavePools } from '../App/hooks/useFavePools';
import { skipConfirmIF, useSkipConfirm } from '../App/hooks/useSkipConfirm';
import { SlippageMethodsIF, useSlippage } from '../App/hooks/useSlippage';
import { IS_LOCAL_ENV } from '../constants';
import { slippage } from '../utils/data/slippage';
import { getMoneynessRank } from '../utils/functions/getMoneynessRank';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { setDenomInBase } from '../utils/state/tradeDataSlice';
import { CrocEnvContext } from './CrocEnvContext';
import { TradeTokenContext } from './TradeTokenContext';

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

    const tradeData = useAppSelector((state) => state.tradeData);

    const dispatch = useDispatch();

    const userPreferencesProps = {
        favePools: useFavePools(),
        swapSlippage: useSlippage('swap', slippage.swap),
        mintSlippage: useSlippage('mint', slippage.mint),
        repoSlippage: useSlippage('repo', slippage.reposition),
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

    const isBaseTokenMoneynessGreaterOrEqual: boolean = useMemo(
        () =>
            getMoneynessRank(baseTokenAddress.toLowerCase() + '_' + chainId) -
                getMoneynessRank(
                    quoteTokenAddress.toLowerCase() + '_' + chainId,
                ) >=
            0,
        [baseTokenAddress, quoteTokenAddress, chainId],
    );
    function updateDenomIsInBase() {
        // we need to know if the denom token is base or quote
        // currently the denom token is the cheaper one by default
        // ergo we need to know if the cheaper token is base or quote
        // whether pool price is greater or less than 1 indicates which is more expensive
        // if pool price is < 0.1 then denom token will be quote (cheaper one)
        // if pool price is > 0.1 then denom token will be base (also cheaper one)
        // then reverse if didUserToggleDenom === true

        const isDenomInBase = isBaseTokenMoneynessGreaterOrEqual
            ? tradeData.didUserFlipDenom
            : !tradeData.didUserFlipDenom;

        return isDenomInBase;
    }
    useEffect(() => {
        const isDenomBase = updateDenomIsInBase();
        if (isDenomBase !== undefined) {
            if (tradeData.isDenomBase !== isDenomBase) {
                IS_LOCAL_ENV && console.debug('denomination changed');
                dispatch(setDenomInBase(isDenomBase));
            }
        }
    }, [
        tradeData.didUserFlipDenom,
        tradeData.tokenA.address,
        tradeData.tokenA.chainId,
        tradeData.tokenB.address,
        tradeData.tokenB.chainId,
        isBaseTokenMoneynessGreaterOrEqual,
    ]);
    /* ------------------------------------------ END USER PREFERENCES CONTEXT ------------------------------------------ */

    return (
        <UserPreferenceContext.Provider value={userPreferences}>
            {props.children}
        </UserPreferenceContext.Provider>
    );
};

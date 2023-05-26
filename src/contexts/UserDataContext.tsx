import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAccount } from 'wagmi';
import {
    getRecentTokensParamsIF,
    useRecentTokens,
} from '../App/hooks/useRecentTokens';
import { TokenIF } from '../utils/interfaces/TokenIF';
import { resetUserGraphData } from '../utils/state/graphDataSlice';
import { CrocEnvContext } from './CrocEnvContext';

interface UserDataIF {
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: getRecentTokensParamsIF) => TokenIF[];
}

export const UserDataContext = createContext<UserDataIF>({} as UserDataIF);

// BIG NOTE: move addRecentToken and getRecentToken to TOKEN CONTEXT, move userDataContext UNDER tokenContext
export const UserDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const dispatch = useDispatch();
    const { chainData } = useContext(CrocEnvContext);
    const { address: userAddress } = useAccount();

    const { addRecentToken, getRecentTokens } = useRecentTokens(
        chainData.chainId,
    );
    useEffect(() => {
        dispatch(resetUserGraphData());
    }, [userAddress]);

    const userDataState = {
        addRecentToken,
        getRecentTokens,
    };

    return (
        <UserDataContext.Provider value={userDataState}>
            {props.children}
        </UserDataContext.Provider>
    );
};

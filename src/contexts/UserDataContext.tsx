import React, { Dispatch, SetStateAction, createContext } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';

import { ConnectArgs, Connector } from '@wagmi/core';
import { checkBlacklist } from '../utils/data/blacklist';

interface UserDataContextIF {
    isUserConnected: boolean | undefined;
    userAddress: `0x${string}` | undefined;
    disconnectUser: () => void;
    connectUser: (args?: Partial<ConnectArgs> | undefined) => void;
    connectError: Error | null;
    connectIsLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectors: Connector<any, any, any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingConnector: Connector<any, any, any> | undefined;

    ensName: string | null | undefined;
    resolvedAddressFromContext: string;
    setResolvedAddressInContext: Dispatch<SetStateAction<string>>;
}
export const UserDataContext = createContext<UserDataContextIF>(
    {} as UserDataContextIF,
);

export const UserDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [resolvedAddressFromContext, setResolvedAddressInContext] =
        React.useState<string>('');

    const { address: userAddress, isConnected: isUserConnected } = useAccount();
    const { disconnect: disconnectUser } = useDisconnect();
    const {
        connect: connectUser,
        connectors,
        error: connectError,
        isLoading: connectIsLoading,
        pendingConnector,
    } = useConnect({
        onSettled(data, error) {
            if (error) console.error({ error });
            const connectedAddress = data?.account;
            const isBlacklisted = connectedAddress
                ? checkBlacklist(connectedAddress)
                : false;
            if (isBlacklisted) disconnectUser();
        },
    });
    const { data: ensName } = useEnsName({ address: userAddress });

    const userDataContext: UserDataContextIF = {
        isUserConnected,
        userAddress,
        disconnectUser,
        ensName,
        connectUser,
        connectors,
        connectError,
        connectIsLoading,
        pendingConnector,
        resolvedAddressFromContext,
        setResolvedAddressInContext,
    };

    return (
        <UserDataContext.Provider value={userDataContext}>
            {props.children}
        </UserDataContext.Provider>
    );
};

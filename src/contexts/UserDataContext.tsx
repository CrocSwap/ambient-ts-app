import React, { Dispatch, SetStateAction, createContext } from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { ConnectArgs, Connector } from '@wagmi/core';
import { checkBlacklist } from '../ambient-utils/constants';
import { UserXpIF } from '../ambient-utils/types';
import { fetchUserXpData } from '../ambient-utils/api';

interface UserDataContextIF {
    isUserConnected: boolean | undefined;
    userAddress: `0x${string}` | undefined;
    disconnectUser: () => void;
    connectUser: (args?: Partial<ConnectArgs> | undefined) => void;
    connectedUserXp: ConnectedUserXpDataIF;
    connectError: Error | null;
    connectIsLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectors: Connector<any, any, any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingConnector: Connector<any, any, any> | undefined;

    ensName: string | null | undefined;
    resolvedAddressFromContext: string;
    setResolvedAddressInContext: Dispatch<SetStateAction<string>>;
    secondaryEnsFromContext: string;
    setSecondaryEnsInContext: Dispatch<SetStateAction<string>>;
}

export interface ConnectedUserXpDataIF {
    dataReceived: boolean;
    data: UserXpIF | undefined;
}

export const TempNonUserXp = {
    dataReceived: true,
    data: {
        userAddress: '0x50F09108b78290422e3cdB3153207e664e09f960',
        leaderboardRank: 1,
        currentLevel: 0,
        recentPoints: 0,
        totalPoints: 0,
        pointsRemainingToNextLevel: 0,
        pointsHistory: [
            {
                addedPoints: 0,
                cumulativePoints: 0,
                level: 0,
                snapshotUnixTime: 0,
            },
            {
                addedPoints: 0,
                cumulativePoints: 0,
                level: 0,
                snapshotUnixTime: 0,
            },
            {
                addedPoints: 0,
                cumulativePoints: 0,
                level: 0,
                snapshotUnixTime: 0,
            },
        ],
    },
};
export const UserDataContext = createContext<UserDataContextIF>(
    {} as UserDataContextIF,
);

export const UserDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [resolvedAddressFromContext, setResolvedAddressInContext] =
        React.useState<string>('');
    const [secondaryEnsFromContext, setSecondaryEnsInContext] =
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

    const [connectedUserXp, setConnectedUserXp] =
        React.useState<ConnectedUserXpDataIF>({
            dataReceived: false,
            data: undefined,
        });

    React.useEffect(() => {
        if (userAddress) {
            fetchUserXpData({ user: userAddress }).then((data) => {
                setConnectedUserXp({
                    dataReceived: true,
                    data: data,
                });
            });
        }
    }, [userAddress]);

    const userDataContext: UserDataContextIF = {
        isUserConnected,
        userAddress,
        disconnectUser,
        ensName,
        connectedUserXp,
        connectUser,
        connectors,
        connectError,
        connectIsLoading,
        pendingConnector,
        resolvedAddressFromContext,
        setResolvedAddressInContext,
        secondaryEnsFromContext,
        setSecondaryEnsInContext,
    };
    console.log({ resolvedAddressFromContext });

    return (
        <UserDataContext.Provider value={userDataContext}>
            {props.children}
        </UserDataContext.Provider>
    );
};

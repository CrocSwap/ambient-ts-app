import React, {
    Dispatch,
    SetStateAction,
    createContext,
    useEffect,
    useState,
} from 'react';
import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { ConnectArgs, Connector } from '@wagmi/core';
import { checkBlacklist } from '../ambient-utils/constants';
import { fetchEnsAddress } from '../ambient-utils/api';
import useChatApi from '../components/Chat/Service/ChatApi';

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
    userAccountProfile: string | undefined;
    setUserAccountProfile: Dispatch<SetStateAction<string | undefined>>;
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

    const { getUserAvatarImageAndID } = useChatApi();

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
    const { data: ensNameFromWagmi } = useEnsName({ address: userAddress });

    const [ensName, setEnsName] = useState('');

    const [userAccountProfile, setUserAccountProfile] = useState<
        string | undefined
    >(undefined);

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (ensNameFromWagmi) {
                setEnsName(ensNameFromWagmi);
            } else if (userAddress) {
                try {
                    const ensResult = await fetchEnsAddress(userAddress);
                    if (ensResult) setEnsName(ensResult);
                    else setEnsName('');
                } catch (error) {
                    setEnsName('');
                    console.error({ error });
                }
            }
        })();
    }, [ensNameFromWagmi, userAddress]);

    useEffect(() => {
        (async () => {
            if (userAddress) {
                try {
                    getUserAvatarImageAndID(userAddress).then((result: any) => {
                        if (result.status === 'OK') {
                            setUserAccountProfile(
                                () => result.userData.avatarImage,
                            );
                        }
                    });
                } catch (error) {
                    setUserAccountProfile('');
                    console.error({ error });
                }
            }
        })();
    }, [userAddress, isUserConnected]);

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
        userAccountProfile,
        setUserAccountProfile,
    };

    return (
        <UserDataContext.Provider value={userDataContext}>
            {props.children}
        </UserDataContext.Provider>
    );
};

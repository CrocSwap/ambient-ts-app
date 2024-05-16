import React, {
    Dispatch,
    SetStateAction,
    createContext,
    useEffect,
    useState,
} from 'react';
import { useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers5/react';
import { checkBlacklist } from '../ambient-utils/constants';
import { BlastUserXpIF, UserXpIF } from '../ambient-utils/types';
import { fetchEnsAddress } from '../ambient-utils/api';

interface UserDataContextIF {
    isUserConnected: boolean | undefined;
    userAddress: `0x${string}` | undefined;
    disconnectUser: () => void;

    ensName: string | null | undefined;
    resolvedAddressFromContext: string;
    setResolvedAddressInContext: Dispatch<SetStateAction<string>>;
    secondaryEnsFromContext: string;
    setSecondaryEnsInContext: Dispatch<SetStateAction<string>>;
}

export interface UserXpDataIF {
    dataReceived: boolean;
    data: UserXpIF | undefined;
}

export interface BlastUserXpDataIF {
    dataReceived: boolean;
    data: BlastUserXpIF | undefined;
}

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

    const { address: userAddress, isConnected: isUserConnected } =
        useWeb3ModalAccount();
    const { disconnect: disconnectUser } = useDisconnect();
    const isBlacklisted = userAddress ? checkBlacklist(userAddress) : false;
    if (isBlacklisted) disconnectUser();

    const [ensName, setEnsName] = useState('');
    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (userAddress) {
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
    }, [userAddress]);

    const userDataContext: UserDataContextIF = {
        isUserConnected,
        userAddress,
        disconnectUser,
        ensName,
        resolvedAddressFromContext,
        setResolvedAddressInContext,
        secondaryEnsFromContext,
        setSecondaryEnsInContext,
    };

    return (
        <UserDataContext.Provider value={userDataContext}>
            {props.children}
        </UserDataContext.Provider>
    );
};

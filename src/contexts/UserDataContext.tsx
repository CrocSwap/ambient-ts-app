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
import { BlastUserXpIF, UserXpIF } from '../ambient-utils/types';
import { fetchEnsAddress } from '../ambient-utils/api';
import { UserAvatarDataIF } from '../components/Chat/ChatIFs';
import { getAvatarRest } from '../components/Chat/ChatUtilsHelper';

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
    userProfileNFT: string | undefined;
    setUserProfileNFT: Dispatch<SetStateAction<string | undefined>>;
    userThumbnailNFT: string | undefined;
    setUserThumbnailNFT: Dispatch<SetStateAction<string | undefined>>;
    currentUserID: string | undefined;
    setCurrentUserID: Dispatch<SetStateAction<string | undefined>>;
    isfetchNftTriggered: boolean;
    setIsfetchNftTriggered: Dispatch<SetStateAction<boolean>>;
    secondaryEnsFromContext: string;
    setSecondaryEnsInContext: Dispatch<SetStateAction<string>>;
    nftTestWalletAddress: string;
    setNftTestWalletAddress: Dispatch<SetStateAction<string>>;
    userAvatarData: UserAvatarDataIF | undefined;
    updateUserAvatarData: (
        walletID: string,
        avatarData: UserAvatarDataIF,
    ) => void;
}

export interface UserXpDataIF {
    dataReceived: boolean;
    data: UserXpIF | undefined;
}
export interface UserNftIF {
    userID: string;
    avatarImage: string | undefined;
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
    const { data: ensNameFromWagmi } = useEnsName({ address: userAddress });

    const [ensName, setEnsName] = useState('');

    const [userProfileNFT, setUserProfileNFT] = useState<string | undefined>(
        undefined,
    );

    const [userThumbnailNFT, setUserThumbnailNFT] = useState<
        string | undefined
    >(undefined);

    const [currentUserID, setCurrentUserID] = useState<string | undefined>(
        undefined,
    );

    const [isfetchNftTriggered, setIsfetchNftTriggered] =
        useState<boolean>(false);

    const [nftTestWalletAddress, setNftTestWalletAddress] =
        useState<string>('');

    const [userAvatarData, setUserAvatarData] = useState<
        UserAvatarDataIF | undefined
    >();

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

            // fetch user avatar
            if (userAddress) {
                const resp = await getAvatarRest(userAddress);
                setUserAvatarData(resp);
            }
        })();
    }, [ensNameFromWagmi, userAddress]);

    const updateUserAvatarData = (
        walletID: string,
        avatarData: UserAvatarDataIF,
    ) => {
        if (walletID == userAddress) {
            setUserAvatarData(avatarData);
        }
    };

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
        secondaryEnsFromContext,
        setSecondaryEnsInContext,
        userProfileNFT,
        setUserProfileNFT,
        userThumbnailNFT,
        setUserThumbnailNFT,
        currentUserID,
        setCurrentUserID,
        setIsfetchNftTriggered,
        isfetchNftTriggered,
        nftTestWalletAddress,
        setNftTestWalletAddress,
        userAvatarData,
        updateUserAvatarData,
    };

    return (
        <UserDataContext.Provider value={userDataContext}>
            {props.children}
        </UserDataContext.Provider>
    );
};

import { useDisconnect, useWeb3ModalAccount } from '@web3modal/ethers/react';
import React, {
    Dispatch,
    SetStateAction,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { fetchEnsAddress } from '../ambient-utils/api';
import { checkBlacklist } from '../ambient-utils/constants';
import { BlastUserXpIF, UserXpIF } from '../ambient-utils/types';
import { UserAvatarDataIF } from '../components/Chat/ChatIFs';
import { getAvatarRest } from '../components/Chat/ChatUtilsHelper';
import { AppStateContext } from './AppStateContext';

export interface UserDataContextIF {
    isUserConnected: boolean | undefined;
    userAddress: `0x${string}` | undefined;
    walletChain: number | undefined;
    disconnectUser: () => void;

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

export const UserDataContext = createContext({} as UserDataContextIF);

export const UserDataContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [resolvedAddressFromContext, setResolvedAddressInContext] =
        React.useState<string>('');
    const [secondaryEnsFromContext, setSecondaryEnsInContext] =
        React.useState<string>('');

    const {
        address: userAddress,
        isConnected: isUserConnected,
        chainId: walletChain,
    } = useWeb3ModalAccount();

    const { isUserOnline } = useContext(AppStateContext);

    const { disconnect: disconnectUser } = useDisconnect();
    const isBlacklisted = userAddress ? checkBlacklist(userAddress) : false;
    if (isBlacklisted) disconnectUser();

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
        if (isUserOnline) {
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

                // fetch user avatar
                if (userAddress) {
                    const resp = await getAvatarRest(userAddress);
                    setUserAvatarData(resp);
                }
            })();
        }
    }, [userAddress, isUserOnline]);

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
        walletChain,
        disconnectUser,
        ensName,
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

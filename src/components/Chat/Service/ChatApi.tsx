import { ethers } from 'ethers';
import { useContext } from 'react';
import { CHAT_BACKEND_URL } from '../../../ambient-utils/constants';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { LS_USER_VERIFY_TOKEN } from '../ChatConstants/ChatConstants';
import {
    getTopRoomsEndpoint,
    getUserAvatarEndpoint,
    getUserAvatarImageByAccountEndpoint,
    getUserIsVerified,
    getVerificationMessageEndpoint,
    updateUserWithAvatarImageEndpoint,
    verifyUserEndpoint,
} from '../ChatConstants/ChatEndpoints';
import {
    getLS,
    // getUserAvatarEndpoint,
    // getUserAvatarImageByAccountEndpoint,
    getUserVerifyToken,
    setLS,
} from '../ChatUtils';

import { useAppKitProvider } from '@reown/appkit/react';

const host = CHAT_BACKEND_URL;

const useChatApi = () => {
    const { userAddress } = useContext(UserDataContext);
    const { walletProvider } = useAppKitProvider('eip155');

    const getSigner = async () => {
        if (walletProvider) {
            const w3provider = new ethers.BrowserProvider(
                walletProvider as ethers.Eip1193Provider,
            );
            return await w3provider.getSigner();
        }
        return null;
    };

    async function getStatus() {
        // Hit the chat /status endpoint to see if it's online
        try {
            const response = await fetch(host + '/chat/api/status', {
                method: 'GET',
            });
            return response.status === 200;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async function getID() {
        if (userAddress) {
            const response = await fetch(
                host + '/chat/api/auth/getUserByAccount/' + userAddress,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            return data;
        }
    }

    async function getIDByUserAddress(userAddress: string) {
        if (userAddress) {
            const response = await fetch(
                host + '/chat/api/auth/getUserByAccount/' + userAddress,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            return data;
        }
    }

    async function getName(id: string) {
        const response = await fetch(
            host + '/chat/api/auth/getNamebyID/' + id,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }

    async function getNameOrWallet(_account: string) {
        const response = await fetch(
            host + '/chat/api/auth/getUserByAccountMention/' + _account,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }

    async function receiveUsername(_username: string) {
        const response = await fetch(
            host + '/chat/api/auth/getUserByUsername/' + _username,
            {
                method: 'GET',
            },
        );
        const data = await response.json();

        return data;
    }

    async function getRepliedMessageInfo(_id: string) {
        const response = await fetch(
            host + '/chat/api/messages/getMsgWithId/' + _id,
            {
                method: 'GET',
            },
        );
        const data = await response.json();

        return data;
    }

    async function updateUser(
        _id: string,
        ensName: string,
        userCurrentPool: string,
    ) {
        if (!_id) return;

        const response = await fetch(host + '/chat/api/auth/updateUser', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                _id: _id,
                ensName: ensName,
                userCurrentPool: userCurrentPool,
            }),
        });
        const data = await response.json();

        return data;
    }

    async function updateMessageUser(sender: string, ensName: string) {
        const response = await fetch(
            host + '/chat/api/messages/updateMessageUser',
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: sender,
                    ensName: ensName,
                }),
            },
        );
        const data = await response.json();

        return data;
    }

    async function deleteMessage(_id: string, isModerator: boolean) {
        const response = await fetch(
            host + '/chat/api/messages/deleteMessagev2/' + _id,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isModerator: isModerator,
                }),
            },
        );
        const data = await response.json();
        return data;
    }

    async function saveUser(walletID: string, ensName: string) {
        const response = await fetch(host + '/chat/api/auth/saveUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletID: walletID,
                ensName: ensName,
            }),
        });
        const data = await response.json();

        return data;
    }

    async function getUserAvatarImageAndID(userAddress: string) {
        if (userAddress) {
            const response = await fetch(
                CHAT_BACKEND_URL +
                    getUserAvatarImageByAccountEndpoint +
                    '/' +
                    userAddress,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            return data;
        }
    }

    async function updateUserWithAvatarImage(
        walletID: `0x${string}`,
        userAvatarImage: string,
    ) {
        const response = await fetch(
            CHAT_BACKEND_URL + updateUserWithAvatarImageEndpoint,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletID: walletID,
                    avatarImage: userAvatarImage,
                    verifyToken: getUserVerifyToken(walletID),
                }),
            },
        );
        const data = await response.json();
        return data;
    }

    async function getUserAvatar(walletID: string) {
        if (walletID && walletID.length > 0) {
            const response = await fetch(
                CHAT_BACKEND_URL + getUserAvatarEndpoint + '/' + walletID,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            return data;
        }
        return '';
    }

    async function getTopRooms() {
        const response = await fetch(CHAT_BACKEND_URL + getTopRoomsEndpoint, {
            method: 'GET',
        });
        const data = await response.json();
        return data;
    }

    async function getVerificationMessage() {
        const response = await fetch(
            CHAT_BACKEND_URL + getVerificationMessageEndpoint,
            {
                method: 'GET',
            },
        );
        const data = await response.json();

        return data && data.verificationMessage ? data.verificationMessage : '';
    }

    async function sendVerifyRequest(verifyToken: string, verifyDate: Date) {
        const response = await fetch(CHAT_BACKEND_URL + verifyUserEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletID: userAddress,
                verifyToken: verifyToken,
                verifyDate: verifyDate,
            }),
        });
        const data = await response.json();

        return data;
    }

    async function verifyWalletService(verificationDate: Date) {
        // this assignment will be deleted after backend deployment
        let verificationText =
            'Verify your wallet address in order to access additional chat functionality.\n\nYou can update your avatar on https://ambient.finance/account \n\nBy continuing to use chat you accept the Ambient Finance Terms of Service (https://ambient.finance/terms) and Privacy Policy (https://ambient.finance/privacy). \n\nThis request will not trigger a blockchain transaction or cost any gas fees. \n\n';

        try {
            const serverSideText = await getVerificationMessage();
            verificationText = serverSideText;
        } catch (err) {
            console.error(err);
        }

        const signer = await getSigner();
        if (signer) {
            return new Promise((resolve, reject) => {
                const message =
                    verificationText + 'Wallet address:\n' + userAddress;

                // signer.signMessage(message)
                signer
                    .signMessage(
                        message.substring(
                            0,
                            message.indexOf('Wallet address:'),
                        ),
                    )
                    // eslint-disable-next-line
                    .then(async (signedMessage: any) => {
                        const resp = await sendVerifyRequest(
                            signedMessage,
                            verificationDate,
                        );
                        setLS(LS_USER_VERIFY_TOKEN, signedMessage, userAddress);
                        resolve(resp);
                    })
                    // eslint-disable-next-line
                    .catch((error: any) => {
                        // Handle error
                        reject(error);
                    });
            });
        }
    }

    async function isUserVerified() {
        if (userAddress) {
            const userToken = getLS(LS_USER_VERIFY_TOKEN, userAddress);
            if (!userToken) return false;
            const encodedAddress = encodeURIComponent(userAddress);
            let encodedToken = '';
            if (userToken && userToken.length > 20) {
                encodedToken = encodeURIComponent(userToken.substring(0, 20));
            }
            const response = await fetch(
                CHAT_BACKEND_URL +
                    getUserIsVerified +
                    encodedAddress +
                    '/' +
                    encodedToken,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            return data;
        }
    }

    return {
        getStatus,
        getID,
        getNameOrWallet,
        receiveUsername,
        getName,
        updateUser,
        updateMessageUser,
        saveUser,
        deleteMessage,
        getRepliedMessageInfo,
        getUserAvatarImageAndID,
        updateUserWithAvatarImage,
        getUserAvatar,
        getIDByUserAddress,
        getTopRooms,
        getVerificationMessage,
        sendVerifyRequest,
        verifyWalletService,
        isUserVerified,
    };
};
export default useChatApi;

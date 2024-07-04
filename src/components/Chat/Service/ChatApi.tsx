import { CHAT_BACKEND_URL } from '../../../ambient-utils/constants';
import { useContext } from 'react';
import { UserDataContext } from '../../../contexts/UserDataContext';
import {
    // getUserAvatarEndpoint,
    // getUserAvatarImageByAccountEndpoint,
    getUserVerifyToken,
    // updateUserWithAvatarImageEndpoint,
} from '../ChatUtils';
import {
    getTopRoomsEndpoint,
    getUserAvatarEndpoint,
    getUserAvatarImageByAccountEndpoint,
    getVerificationMessageEndpoint,
    updateUserWithAvatarImageEndpoint,
} from '../ChatConstants/ChatEndpoints';

const host = CHAT_BACKEND_URL;

const useChatApi = () => {
    const { userAddress } = useContext(UserDataContext);

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
    };
};
export default useChatApi;

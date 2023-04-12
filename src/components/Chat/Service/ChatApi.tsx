import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
export const host = 'https://ambichat.link:5000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

const useChatApi = (setIsChatEnabled: Dispatch<SetStateAction<boolean>>) => {
    const { address } = useAccount();
    const [fetchFailed, setFetchFailed] = useState(false);

    useEffect(() => {
        // Disable chat if we lose connection
        // TODO (#1800): make it possible to re-enable if we get back a connection
        if (fetchFailed) {
            console.log('CHAT SET FAILED');
            setIsChatEnabled(false);
        } else {
            console.log('~CHAT SET ENABLED~');
            // setIsChatEnabled(true);
        }
    }, [fetchFailed]);

    async function getID() {
        if (address) {
            try {
                const response = await fetch(
                    host + '/api/auth/getUserByAccount/' + address,
                    {
                        method: 'GET',
                    },
                );
                const data = await response.json();
                setFetchFailed(false);
                return data;
            } catch {
                setFetchFailed(true);
            }
        }
    }

    async function getName(id: string) {
        try {
            const response = await fetch(host + '/api/auth/getNamebyID/' + id, {
                method: 'GET',
            });
            const data = await response.json();
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }

    async function getNameOrWallet(_account: string) {
        try {
            const response = await fetch(
                host + '/api/auth/getUserByAccountMention/' + _account,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }

    async function receiveUsername(_username: string) {
        try {
            const response = await fetch(
                host + '/api/auth/getUserByUsername/' + _username,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }

    async function updateUser(
        _id: string,
        ensName: string,
        userCurrentPool: string,
    ) {
        try {
            const response = await fetch(host + '/api/auth/updateUser', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _id: _id,
                    ensName: ensName,
                    userCurrentPool: userCurrentPool,
                }),
            });
            const data = await response.json();
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }

    async function updateMessageUser(sender: string, ensName: string) {
        try {
            const response = await fetch(
                host + '/api/messages/updateMessageUser',
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
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }

    async function deleteMessage(_id: string) {
        try {
            const response = await fetch(
                host + '/api/messages/deleteMessage/' + _id,
                {
                    method: 'DELETE',
                },
            );
            const data = await response.json();
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }

    async function saveUser(walletID: string, ensName: string) {
        try {
            const response = await fetch(host + '/api/auth/saveUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletID: walletID,
                    ensName: ensName,
                }),
            });
            const data = await response.json();
            setFetchFailed(false);
            return data;
        } catch {
            setFetchFailed(true);
        }
    }
    return {
        getID,
        getNameOrWallet,
        receiveUsername,
        getName,
        updateUser,
        updateMessageUser,
        saveUser,
        deleteMessage,
    };
};
export default useChatApi;

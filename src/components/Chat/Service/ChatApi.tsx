import { useAccount } from 'wagmi';
export const host = 'https://ambichat.link:5000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

const useChatApi = () => {
    const { address } = useAccount();

    async function getID() {
        if (address) {
            const response = await fetch(host + '/api/auth/getUserByAccount/' + address, {
                method: 'GET',
            });
            const data = await response.json();
            if (data.status === 'OK') {
                return data;
            } else {
                return data;
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function getName(id: any) {
        const response = await fetch(host + '/api/auth/getNamebyID/' + id, {
            method: 'GET',
        });
        const data = await response.json();
        if (data.status === 'OK') {
            return data;
        } else {
            return data;
        }
    }

    async function getNameOrWallet(_account: string) {
        const response = await fetch(host + '/api/auth/getUserByAccountMention/' + _account, {
            method: 'GET',
        });
        const data = await response.json();
        return data;
    }

    async function receiveUsername(_username: string) {
        const response = await fetch(host + '/api/auth/getUserByUsername/' + _username, {
            method: 'GET',
        });
        const data = await response.json();

        return data;
    }

    async function updateUser(_id: string, ensName: string, userCurrentPool: string) {
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

        return data;
    }

    async function updateMessageUser(sender: string, ensName: string) {
        const response = await fetch(host + '/api/messages/updateMessageUser', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: sender,
                ensName: ensName,
            }),
        });
        const data = await response.json();

        return data;
    }

    async function deleteMessage(_id: string) {
        const response = await fetch(host + '/api/messages/deleteMessage/' + _id, {
            method: 'DELETE',
        });
        const data = await response.json();

        return data;
    }

    async function saveUser(walletID: string, ensName: string) {
        const response = await fetch(host + '/api/auth/saveUser', {
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

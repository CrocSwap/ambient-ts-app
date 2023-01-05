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
                console.error('else', data);
                return data;
            }
        }
    }

    async function getNameOrWallet(_id: string) {
        const response = await fetch(host + '/api/auth/getUserByAccount/' + _id, {
            method: 'GET',
        });
        const data = await response.json();
        if (data.ensName === '') {
            return data.walletID;
        } else {
            return data.ensName;
        }
    }

    return { getID, getNameOrWallet };
};
export default useChatApi;

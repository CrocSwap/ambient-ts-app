import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { CHAT_BACKEND_WSS_URL, CHAT_BACKEND_URL } from '../../../constants';
import { Message } from '../Model/MessageModel';
import { User } from '../Model/UserModel';

const useChatSocket = (
    room: string,
    areSubscriptionsEnabled = true,
    isChatOpen = true,
    address?: string,
    ensName?: string | null,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketRef: any = useRef();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();

    const messagesRef = useRef<Message[]>([]);
    messagesRef.current = messages;

    async function getMsgWithRest(roomInfo: string) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const response = await fetch(
            CHAT_BACKEND_URL +
                '/chat/api/messages/getMsgWithoutWebSocket/' +
                encodedRoomInfo,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }

    async function getUserListWithRest() {
        const response = await fetch(
            CHAT_BACKEND_URL + '/chat/api/auth/getUsersForMent',
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }

    useEffect(() => {
        if (!areSubscriptionsEnabled || !isChatOpen) return;

        if (address !== undefined && address != 'undefined') {
            socketRef.current = io(CHAT_BACKEND_WSS_URL, {
                query: { roomId: room, address, ensName },
            });
        }

        if (isChatOpen) {
            getMsg();
        }

        async function getRest() {
            const data = await getMsgWithRest(room);

            setMessages(data.reverse());
            if (data.length > 0) {
                setLastMessage(data[data.length - 1]);
                setLastMessageText(data[data.length - 1].text);
                setMessageUser(data[data.length - 1].sender);
            }

            const userListData = await getUserListWithRest();
            setUsers(userListData);
        }

        getRest();

        if (socketRef && socketRef.current) {
            // eslint-disable-next-line
            socketRef.current.on('msg-recieve', (data: any) => {
                setMessages([...messagesRef.current, data]);
                if (messagesRef.current[messagesRef.current.length - 1]) {
                    setLastMessage(data);
                    setLastMessageText(data.message);
                    setMessageUser(data.sender);
                }
            });
        }

        return () => {
            if (socketRef && socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [room, areSubscriptionsEnabled, isChatOpen, address]);

    async function getMsg() {
        if (!socketRef.current) return;
        await socketRef.current.emit('msg-recieve', {
            room: room,
        });
    }

    async function deleteMsgFromList(msgId: string) {
        messagesRef.current = messagesRef.current.filter(
            (m) => m._id !== msgId,
        );
        setMessages(messagesRef.current);
    }

    async function sendMsg(
        currentUser: string,
        msg: string,
        room: string,
        ensName: string,
        walletID: string | null,
    ) {
        socketRef.current.emit('send-msg', {
            from: currentUser,
            message: msg,
            roomInfo: room,
            ensName: ensName,
            walletID: walletID,
        });
    }

    return {
        messages,
        getMsg,
        sendMsg,
        lastMessage,
        messageUser,
        lastMessageText,
        deleteMsgFromList,
        users,
    };
};

export default useChatSocket;

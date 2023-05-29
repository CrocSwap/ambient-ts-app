import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { CHAT_BACKEND_WSS_URL, CHAT_BACKEND_URL } from '../../../constants';
import { Message } from '../Model/MessageModel';

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
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();

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

    useEffect(() => {
        if (!areSubscriptionsEnabled || !isChatOpen) return;

        const roomId = room;

        // socketRef.current = io(CHAT_BACKEND_WSS_URL, {
        //     path: '/chat/api/subscribe/',
        //     query: { roomId },
        // });

        socketRef.current = io(CHAT_BACKEND_WSS_URL, {
            query: { roomId, address, ensName },
        });

        if (isChatOpen) {
            getMsg();
        }

        async function getRest() {
            const data = await getMsgWithRest(room);
            console.log('use socket getRest method data');
            console.log(data);
            setMessages(data);
            if (data[0]) {
                setLastMessage(data[0]);
                setLastMessageText(data[0].text);
                setMessageUser(data[0].sender);
            }
        }

        getRest();

        return () => {
            socketRef.current.disconnect();
        };
    }, [room, areSubscriptionsEnabled, isChatOpen]);

    if (socketRef && socketRef.current) {
        socketRef.current.on('msg-recieve', (data: any) => {
            console.log(data);
            setMessages([data, ...messages]);
            if (data[0]) {
                setLastMessage(data[0]);
                setLastMessageText(data[0].text);
                setMessageUser(data[0].sender);
            }
        });
    }

    async function getMsg() {
        if (!socketRef.current) return;
        await socketRef.current.emit('msg-recieve', {
            room: room,
        });
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
    };
};

export default useChatSocket;

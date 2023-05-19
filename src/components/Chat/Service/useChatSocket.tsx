import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { CHAT_BACKEND_WSS_URL } from '../../../constants';
import { Message } from '../Model/MessageModel';

const useChatSocket = (
    room: string,
    areSubscriptionsEnabled = true,
    isChatOpen = true,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketRef: any = useRef();
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();

    useEffect(() => {
        if (!areSubscriptionsEnabled || !isChatOpen) return;

        const roomId = room;
        socketRef.current = io(CHAT_BACKEND_WSS_URL, {
            path: '/chat/api/subscribe/',
            query: { roomId },
        });
        socketRef.current.on('connection');

        socketRef.current.on('send-msg', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            socketRef.current.on('msg-recieve', (data: any) => {
                setMessages(data);
                setLastMessage(data[0]);
                setLastMessageText(data[0].text);
                setMessageUser(data[0].sender);
            });
        });

        if (isChatOpen) {
            getMsg();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketRef.current.on('msg-recieve', (data: any) => {
            setMessages(data);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [room, areSubscriptionsEnabled, isChatOpen]);

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

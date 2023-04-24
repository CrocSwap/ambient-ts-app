import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Message } from '../Model/MessageModel';
export const host = 'https://ambichat.link:5000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

const useSocket = (room: string, areSubscriptionsEnabled = true) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketRef: any = useRef();
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();

    useEffect(() => {
        if (!areSubscriptionsEnabled) return;
        const roomId = room;
        socketRef.current = io(host, { query: { roomId } });
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketRef.current.on('msg-recieve', (data: any) => {
            setMessages(data);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [room, areSubscriptionsEnabled]);

    async function getMsg() {
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

export default useSocket;

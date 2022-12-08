import { setUseProxies } from 'immer';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Message } from '../Model/MessageModel';
export const host = 'http://localhost:5000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

const useSocket = (room: any) => {
    const socketRef: any = useRef();

    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<any>();
    const [messageUser, setMessageUser] = useState<any>();

    useEffect(() => {
        const roomId = room;

        socketRef.current = io(host, { query: { roomId } });
        socketRef.current.on('connection', () => {
            console.log('Connected Socket Id: ' + socketRef.current.id + ' Room: ' + roomId);
        });

        socketRef.current.on('send-msg', () => {
            socketRef.current.on('msg-recieve', (data: any) => {
                setMessages(data);
                setLastMessage(data[0]);
                setMessageUser(data[0].sender);
            });
        });

        socketRef.current.on('msg-recieve', (data: any) => {
            setMessages(data);
        });

        return () => {
            console.log('Disconnected' + socketRef.current.id);
            socketRef.current.disconnect();
        };
    }, [room]);

    async function getMsg() {
        await socketRef.current.emit('msg-recieve', {
            room: room,
        });
    }

    async function sendMsg(currentUser: any, msg: any, room: any, ensName: any, walletID: any) {
        socketRef.current.emit('send-msg', {
            from: currentUser,
            message: msg,
            roomInfo: room,
            ensName: ensName,
            walletID: walletID,
        });
    }

    return { messages, getMsg, sendMsg, lastMessage, messageUser };
};

export default useSocket;

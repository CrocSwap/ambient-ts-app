import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Message } from '../Model/MessageModel';
export const host = 'http://localhost:5000';
export const client = 'http://localhost:3000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

const useSocket = (room: any) => {
    const socketRef: any = useRef();

    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const roomId = room;

        socketRef.current = io(host, { query: { roomId } });
        socketRef.current.on('connection', () => {
            console.log('Connected Socket Id: ' + socketRef.current.id + ' Room: ' + roomId);
        });

        socketRef.current.on('send-msg', () => {
            console.log('send-msg');
            socketRef.current.on('msg-recieve', (data: any) => {
                console.log('msg-recieve data: ', data);

                setMessages(data);
            });
        });

        socketRef.current.on('msg-recieve', (data: any) => {
            console.log('msg-recieve data: ', data);
            setMessages(data);
            // if(messages.length === 0 )
            // {
            //   setMessages(data);
            // }
            // else{
            //   setMessages(() => [messages, ...data]);
            // }
            console.log('msg-recieve messages: ', messages);
        });

        return () => {
            console.log('Disconnected' + socketRef.current.id);
            socketRef.current.disconnect();
        };
    }, [room]);

    async function getMsg() {
        console.log('Geldi');
        socketRef.current.emit('msg-recieve', {
            room: room,
        });
    }

    async function sendMsg(currentUser: any, msg: any, room: any) {
        socketRef.current.emit('send-msg', {
            from: currentUser,
            message: msg,
            roomInfo: room,
        });
    }

    return { messages, getMsg, sendMsg };
};

export default useSocket;

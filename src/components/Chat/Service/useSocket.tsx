import { useEffect, useState, useRef, Dispatch, SetStateAction } from 'react';
import io from 'socket.io-client';
import { Message } from '../Model/MessageModel';
export const host = 'https://ambichat.link:5000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

// TODO (#1810): Replace timeout with a health check endpoint / callback that we can run without metamask connected.
// If we don't get messages within this timeout (ms) we will treat the chat as unreachable and disable it.
// NOTE: we do this for getMessages because this is always run when the chat is rendered regardless of web3 connection (login)
const GET_MESSAGES_TIMEOUT_MS = 10000;

const useSocket = (
    room: string,
    setIsChatEnabled: Dispatch<SetStateAction<boolean>>, // NOTE: we only need to fire timeout setter for ChatPanel
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketRef: any = useRef();
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();
    const [isMsgEmit, setIsMsgEmit] = useState(false);
    const [isMsgRecieve, setIsMessageRecieve] = useState(false);

    useEffect(() => {
        const roomId = room;
        socketRef.current = io(host, { query: { roomId } });
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
            setIsMessageRecieve(true);
            setMessages(data);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [room]);

    async function getMsg() {
        setIsMessageRecieve(false);
        setIsMsgEmit(true);
        await socketRef.current.emit('msg-recieve', {
            room: room,
        });
        setTimeout(() => {
            if (isMsgEmit && !isMsgRecieve) {
                // TODO (#1800): make it possible to re-enable if we get back a connection, maybe on 'reconnect' ?
                // Disable the chat feature on timeout between when we emitted the 'msg-recieve' and got data for it
                setIsChatEnabled(false);
            }
        }, GET_MESSAGES_TIMEOUT_MS);
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

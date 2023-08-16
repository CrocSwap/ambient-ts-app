import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { CHAT_BACKEND_WSS_URL, CHAT_BACKEND_URL } from '../../../constants';
import { Message } from '../Model/MessageModel';
import { User } from '../Model/UserModel';
import { check } from 'prettier';

const useChatSocket = (
    room: string,
    areSubscriptionsEnabled = true,
    isChatOpen = true,
    address?: string,
    ensName?: string | null,
    // onlyMentions = false,
) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketRef: any = useRef();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();
    const [notis, setNotis] = useState<Map<string, number>>();
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [userMap, setUserMap] = useState<Map<string, User>>(
        new Map<string, User>(),
    );

    const messagesRef = useRef<Message[]>([]);
    messagesRef.current = messages;

    async function getMsgWithRest(roomInfo: string) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const url = `${CHAT_BACKEND_URL}/chat/api/messages/getMsgWithoutWebSocket/${encodedRoomInfo}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        setMessages(data.reverse());
        setLastMessage(data);
        setLastMessageText(data.message);
        setMessageUser(data.sender);
        return data.reverse();
    }

    async function getAllMessages(p?: number) {
        const queryParams = 'p=' + p;
        const url = `${CHAT_BACKEND_URL}/chat/api/messages/getall/?${queryParams}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        setMessages((prevMessages) => [...data, ...prevMessages]);
        setLastMessage(data);
        setLastMessageText(data.message);
        setMessageUser(data.sender);
        return data;
    }

    async function getMsgWithRest2(roomInfo: string, p?: number) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const queryParams = 'p=' + p;
        const url = `${CHAT_BACKEND_URL}/chat/api/messages/getMsgWithoutWebSocket/${encodedRoomInfo}?${queryParams}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        setMessages((prevMessages) => [...data.reverse(), ...prevMessages]);
        setLastMessage(data);
        setLastMessageText(data.message);
        setMessageUser(data.sender);

        return data.reverse();
    }

    async function updateLikeDislike(messageId: string, pl: any) {
        const payload = {
            _id: messageId,
            ...pl,
        };

        console.log(payload);

        const response = await fetch(
            CHAT_BACKEND_URL + '/chat/api/messages/updateLikeDislike',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            },
        );
        const data = await response.json();
        console.log(data);
        if (data && data.data && data.data.message) {
            const msg = data.data.message;
            const newMessageList = messages.map((e) => {
                if (e._id == msg._id) {
                    return msg;
                } else {
                    return e;
                }
            });
            console.log(newMessageList);
            setMessages([...newMessageList]);
        }

        return data;
    }

    async function getMentionsWithRest(roomInfo: string) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const response = await fetch(
            CHAT_BACKEND_URL +
                '/chat/api/messages/getMentions/' +
                encodedRoomInfo +
                '/' +
                address,

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

    async function isUserVerified() {
        console.log('is user verified func' + address);
        if (address) {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                CHAT_BACKEND_URL +
                    '/chat/api/auth/isUserVerified/' +
                    encodedAddress,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            return data;
        }
    }

    async function verifyUser(
        verifyToken: string,
        verifySalt: number,
        verifyDate: Date,
    ) {
        const response = await fetch(
            CHAT_BACKEND_URL + '/chat/api/auth/verifyUser',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletID: address,
                    verifyToken: verifyToken,
                    verifySalt: verifySalt,
                    verifyDate: verifyDate,
                }),
            },
        );
        const data = await response.json();
        setIsVerified(data.isVerified);

        return data;
    }

    async function updateVerifyDate(verifyDate: Date) {
        const response = await fetch(
            CHAT_BACKEND_URL + '/chat/api/auth/updateVerifyDate',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletID: address,
                    verifyDate: verifyDate,
                }),
            },
        );
        const data = await response.json();
        setIsVerified(data.isVerified);

        const userListData = await getUserListWithRest();
        const usmp = new Map<string, User>();
        userListData.forEach((user: User) => {
            usmp.set(user._id, user);
        });
        setUserMap(usmp);
        setUsers(userListData);

        return data;
    }

    async function updateUserCache() {
        const userListData = await getUserListWithRest();
        const usmp = new Map<string, User>();
        userListData.forEach((user: User) => {
            usmp.set(user._id, user);
        });
        setUserMap(usmp);
        setUsers(userListData);
    }

    useEffect(() => {
        console.log('im checking verified user.........');

        async function checkVerified() {
            const data = await isUserVerified();
            if (!data) return;
            console.log(
                localStorage.getItem('vrfTkn' + address) == data.vrfTkn,
            );
            setIsVerified(
                localStorage.getItem('vrfTkn' + address) == data.vrfTkn &&
                    data.vrfTkn != null,
            );
        }

        checkVerified();

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
            const data =
                room === 'Admins'
                    ? await getAllMessages()
                    : await getMsgWithRest(room);
            setMessages(data.reverse());
            if (data.length > 0) {
                setLastMessage(data[data.length - 1]);
                setLastMessageText(data[data.length - 1].text);
                setMessageUser(data[data.length - 1].sender);
            }

            const userListData = await getUserListWithRest();
            const usmp = new Map<string, User>();
            userListData.forEach((user: User) => {
                usmp.set(user._id, user);
            });
            setUserMap(usmp);
            setUsers(userListData);
        }

        getRest();

        if (socketRef && socketRef.current) {
            // eslint-disable-next-line
            socketRef.current.on('msg-recieve', (data: any) => {
                console.log('msg-recieve', data);
                setMessages([...messagesRef.current, data]);
                if (messagesRef.current[messagesRef.current.length - 1]) {
                    setLastMessage(data);
                    setLastMessageText(data.message);
                    setMessageUser(data.sender);
                }
            });

            socketRef.current.on('noti', (data: any) => {
                console.log('.....................');
                console.log(data);
                console.log('.....................');

                if (notis) {
                    const checkVal = notis.get(data.roomInfo);
                    if (checkVal != undefined) {
                        setNotis(notis.set(data.roomInfo, checkVal + 1));
                    } else {
                        setNotis(notis.set(data.roomInfo, 1));
                    }
                } else {
                    const nts = new Map<string, number>();
                    nts.set(data.roomInfo, 1);
                    setNotis(nts);
                }
            });
        }

        return () => {
            if (socketRef && socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [room, areSubscriptionsEnabled, isChatOpen, address, notis]);

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
        mentionedName: string | null,
        mentionedWalletID: string | null,
        repliedMessage?: string | undefined,
        repliedMessageRoomInfo?: string | undefined,
    ) {
        socketRef.current.emit('send-msg', {
            from: currentUser,
            message: msg,
            roomInfo: room,
            ensName: ensName,
            walletID: walletID,
            mentionedName: mentionedName,
            isMentionMessage: mentionedName ? true : false,
            mentionedWalletID,
            repliedMessage: repliedMessage,
            repliedMessageRoomInfo: repliedMessageRoomInfo,
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
        notis,
        updateLikeDislike,
        socketRef,
        isVerified,
        verifyUser,
        userMap,
        updateVerifyDate,
        updateUserCache,
        getMsgWithRest2,
        getAllMessages,
    };
};

export default useChatSocket;

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import {
    CHAT_BACKEND_WSS_URL,
    CHAT_BACKEND_URL,
    getMessageWithRestEndpoint,
    getAllMessagesEndpoint,
    getMessageWithRestWithPaginationEndpoint,
    updateLikesDislikesCountEndpoint,
    getMentionsWithRestEndpoint,
    getUserListWithRestEndpoint,
    getUserIsVerified,
    verifyUserEndpoint,
    updateVerifiedDateEndpoint,
    addReactionEndpoint,
} from '../../../constants';
import { Message } from '../Model/MessageModel';
import { User } from '../Model/UserModel';

const useChatSocket = (
    room: string,
    areSubscriptionsEnabled = true,
    isChatOpen = true,
    address?: string,
    ensName?: string | null,
) => {
    // eslint-disable-next-line
    const socketRef: any = useRef();
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [lastMessageText, setLastMessageText] = useState('');
    const [messageUser, setMessageUser] = useState<string>();
    const [notifications, setNotifications] = useState<Map<string, number>>();
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [userMap, setUserMap] = useState<Map<string, User>>(
        new Map<string, User>(),
    );

    const messagesRef = useRef<Message[]>([]);
    messagesRef.current = messages;

    async function getMsgWithRest(roomInfo: string) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const url = `${CHAT_BACKEND_URL}${getMessageWithRestEndpoint}${encodedRoomInfo}`;
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
        const url = `${CHAT_BACKEND_URL}${getAllMessagesEndpoint}?${queryParams}`;
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

    async function getMsgWithRestWithPagination(roomInfo: string, p?: number) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const queryParams = 'p=' + p;
        const url = `${CHAT_BACKEND_URL}${getMessageWithRestWithPaginationEndpoint}${encodedRoomInfo}?${queryParams}`;
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

        const response = await fetch(
            CHAT_BACKEND_URL + updateLikesDislikesCountEndpoint,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            },
        );
        const data = await response.json();
        if (data && data.data && data.data.message) {
            const msg = data.data.message;
            const newMessageList = messages.map((e) => {
                if (e._id == msg._id) {
                    return msg;
                } else {
                    return e;
                }
            });
            setMessages([...newMessageList]);
        }

        return data;
    }

    async function getMentionsWithRest(roomInfo: string) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const response = await fetch(
            CHAT_BACKEND_URL +
                getMentionsWithRestEndpoint +
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
            CHAT_BACKEND_URL + getUserListWithRestEndpoint,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }

    async function isUserVerified() {
        if (address) {
            const encodedAddress = encodeURIComponent(address);
            const response = await fetch(
                CHAT_BACKEND_URL + getUserIsVerified + encodedAddress,
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
        const response = await fetch(CHAT_BACKEND_URL + verifyUserEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletID: address,
                verifyToken: verifyToken,
                verifySalt: verifySalt,
                verifyDate: verifyDate,
            }),
        });
        const data = await response.json();
        setIsVerified(data.isVerified);

        return data;
    }

    async function updateVerifyDate(verifyDate: Date) {
        const response = await fetch(
            CHAT_BACKEND_URL + updateVerifiedDateEndpoint,
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
        async function checkVerified() {
            const data = await isUserVerified();
            if (!data) return;
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

                if (notifications) {
                    const checkVal = notifications.get(data.roomInfo);
                    if (checkVal != undefined) {
                        setNotifications(
                            notifications.set(data.roomInfo, checkVal + 1),
                        );
                    } else {
                        setNotifications(notifications.set(data.roomInfo, 1));
                    }
                } else {
                    const notificationsMap = new Map<string, number>();
                    notificationsMap.set(data.roomInfo, 1);
                    setNotifications(notificationsMap);
                }
            });
        }

        return () => {
            if (socketRef && socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [room, areSubscriptionsEnabled, isChatOpen, address, notifications]);

    async function getMsg() {
        if (!socketRef.current) return;
        await socketRef.current.emit('msg-recieve', {
            room: room,
        });
    }

    async function deleteMsgFromList(msgId: string) {
        const payload = {
            _id: msgId,
        };

        console.log(messages);
        const response = await fetch(
            `${CHAT_BACKEND_URL}/chat/api/messages/deleteMessage/${msgId}`,
            {
                method: 'POST',
            },
        );
        const data = await response.json();
        data.message.deletedMessageText = 'This message has deleted';

        console.log(data.message.deletedMessageText);
        if (data) {
            const msg = data.message;
            const newMessageList = messages.map((e) => {
                if (e._id == msg._id) {
                    console.log('msg');
                    return msg;
                } else {
                    console.log('e');
                    return e;
                }
            });
            console.log(newMessageList);
            setMessages([...newMessageList]);
            console.log('22 ', messages);
        }

        return data;
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

    async function addReaction(
        messageId: string,
        userId: string,
        reaction: string,
    ) {
        const payload = {
            messageId,
            userId,
            reaction,
        };

        const response = await fetch(CHAT_BACKEND_URL + addReactionEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data && data.data && data.data.message) {
            const msg = data.data.message;
            const newMessageList = messages.map((e) => {
                if (e._id == msg._id) {
                    return msg;
                } else {
                    return e;
                }
            });
            setMessages([...newMessageList]);
        }

        return data;
    }

    return {
        messages,
        getMsg,
        sendMsg,
        lastMessage,
        messageUser,
        lastMessageText,
        users,
        notifications,
        updateLikeDislike,
        socketRef,
        isVerified,
        verifyUser,
        userMap,
        updateVerifyDate,
        updateUserCache,
        getMsgWithRestWithPagination,
        getAllMessages,
        deleteMsgFromList,
        setMessages,
        addReaction,
    };
};

export default useChatSocket;

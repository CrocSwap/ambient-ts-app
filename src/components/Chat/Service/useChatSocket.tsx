/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any  */

import { useContext, useEffect, useRef, useState } from 'react';
import { CHAT_BACKEND_URL } from '../../../ambient-utils/constants';

import {
    encodeSocketIOMessage,
    getLS,
    getUnverifiedMsgList,
    getUserVerifyToken,
    removeFromUnverifiedList,
    setLS,
} from '../ChatUtils';

import {
    addReactionEndpoint,
    getAllMessagesEndpoint,
    getMentionsWithRestEndpoint,
    getMessageWithRestEndpoint,
    getMessageWithRestWithPaginationEndpoint,
    getUserDetailsEndpoint,
    getUserIsVerified,
    getUserListWithRestEndpoint,
    updateLikesDislikesCountEndpoint,
    updateUnverifiedMessagesEndpoint,
    updateVerifiedDateEndpoint,
    verifyUserEndpoint,
} from '../ChatConstants/ChatEndpoints';

import { useSocketIO } from 'react-use-websocket';
import {
    LS_USER_NON_VERIFIED_MESSAGES,
    LS_USER_VERIFY_TOKEN,
} from '../ChatConstants/ChatConstants';
import { ChatWsQueryParams, LikeDislikePayload } from '../ChatIFs';
import { domDebug, getTimeForLog } from '../DomDebugger/DomDebuggerUtils';
import { Message } from '../Model/MessageModel';
import { User } from '../Model/UserModel';
import { UserDataContext } from '../../../contexts/UserDataContext';

type ChatSocketListener = {
    msg: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (payload: any) => void;
    componentId: string;
};

const useChatSocket = (
    room: string,
    areSubscriptionsEnabled = true,
    isChatOpen = true,
    activateToastr: (
        message: string,
        type: 'success' | 'error' | 'warning' | 'info',
    ) => void,
    address?: string,
    ensName?: string | null,
    currentUserID?: string,
    freezePanel?: () => void,
    activatePanel?: () => void,
) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [messageUser, setMessageUser] = useState<string>();
    const [notifications, setNotifications] = useState<Map<string, number>>();
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [userMap, setUserMap] = useState<Map<string, User>>(
        new Map<string, User>(),
    );
    const [userVrfToken, setUserVrfToken] = useState<string>('');

    const roomRef = useRef<string>(room);

    const messagesRef = useRef<Message[]>([]);
    const [listeners, setListeners] = useState<ChatSocketListener[]>([]);

    messagesRef.current = messages;

    const getWsQueryParams = () => {
        let queryParams: ChatWsQueryParams = {
            roomId: room,
        };
        if (address != undefined) {
            queryParams = { ...queryParams, address: address };
        }
        if (ensName != undefined && ensName.length > 0) {
            queryParams = { ...queryParams, ensName: ensName };
        }

        return queryParams;
    };

    const [wsQueryParams, setWsQueryParams] = useState<ChatWsQueryParams>(
        getWsQueryParams(),
    );

    const { updateUserAvatarData } = useContext(UserDataContext);

    const url = CHAT_BACKEND_URL + '/chat/api/subscribe/';
    const {
        lastMessage: socketLastMessage,
        sendMessage: socketSendMessage,
        getWebSocket,
    } = useSocketIO(url, {
        // fromSocketIO: true,
        queryParams: { ...wsQueryParams },
        shouldReconnect: () => true,
        onOpen: () => {
            domDebug('connected', getTimeForLog(new Date()));
        },
        onClose: () => {
            domDebug('disconnected', getTimeForLog(new Date()));
        },
    });

    useEffect(() => {
        if (isChatOpen) {
            getWebSocket()?.close();
        }
    }, [isChatOpen]);

    useEffect(() => {
        setWsQueryParams(getWsQueryParams());
    }, [address, ensName]);

    useEffect(() => {
        switch (socketLastMessage.type) {
            case 'msg-recieve-2':
                newMsgListener(socketLastMessage.payload);
                break;
            case 'message-deleted-listener':
                deletedMsgListener(socketLastMessage.payload);
                break;
            case 'message-updated-listener':
                updatedMsgListener(socketLastMessage.payload);
                break;
            case 'set-avatar-listener':
                userListLightUpdate(socketLastMessage.payload);
                handlePossibleAvatarChange(socketLastMessage.payload);
                if (listeners.some((e) => e.msg === socketLastMessage.type)) {
                    const willBeCalled = listeners.filter(
                        (e) => e.msg === socketLastMessage.type,
                    );
                    willBeCalled.map((e) => {
                        e.listener(socketLastMessage.payload);
                    });
                }
                break;
            case 'noti':
                notiListener(socketLastMessage.payload);
                break;
        }
    }, [socketLastMessage]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function sendToSocket(msgType: string, payload: any) {
        const msg = encodeSocketIOMessage(msgType, payload);
        socketSendMessage(msg, true);
    }

    async function getMsgWithRest(roomInfo: string) {
        if (roomInfo == undefined || roomInfo == '') return;

        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const url = `${CHAT_BACKEND_URL}${getMessageWithRestEndpoint}${encodedRoomInfo}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        setMessages(data.reverse());
        setLastMessage(data);
        setMessageUser(data.sender);
        return data.reverse();
    }

    async function fetchForNotConnectedUser() {
        const encodedRoomInfo = encodeURIComponent(room);
        const url = `${CHAT_BACKEND_URL}${getMessageWithRestEndpoint}${encodedRoomInfo}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        setMessages(data.reverse());
        setLastMessage(data);
        setMessageUser(data.sender);
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
        setMessageUser(data.sender);

        return data.reverse();
    }

    async function updateLikeDislike(
        messageId: string,
        pl: LikeDislikePayload,
    ) {
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

    async function verifyUser(verifyToken: string, verifyDate: Date) {
        const response = await fetch(CHAT_BACKEND_URL + verifyUserEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletID: address,
                verifyToken: verifyToken,
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

    async function updateUnverifiedMessages(verifyDate: Date, endDate?: Date) {
        const nonVerifiedMessages = getUnverifiedMsgList(address);
        const vrfTkn = getLS(LS_USER_VERIFY_TOKEN, address);

        const response = await fetch(
            CHAT_BACKEND_URL + updateUnverifiedMessagesEndpoint,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: currentUserID,
                    startDate: verifyDate,
                    msgList: nonVerifiedMessages,
                    vrfTkn: vrfTkn,
                    endDate: endDate,
                }),
            },
        );
        const messages = await response.json();
        updateMessageWithArr(messages);

        // clean up local storage
        messages.map((msg: Message) => {
            removeFromUnverifiedList(msg._id, address);
        });
    }

    async function updateUserCache() {
        const userListData = await getUserListWithRest();
        const usmp = new Map<string, User>();
        userListData.forEach((user: User) => {
            usmp.set(user._id, user);
        });
        setUserMap(usmp);
        setUsers(userListData);
        const userToken = getLS(LS_USER_VERIFY_TOKEN, address);
        setUserVrfToken(userToken ? userToken : '');
    }

    async function getUserSummaryDetails(walletID: string) {
        const encodedWalletID = encodeURIComponent(walletID);
        const response = await fetch(
            CHAT_BACKEND_URL + getUserDetailsEndpoint + '/' + encodedWalletID,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }

    useEffect(() => {
        if (!isChatOpen) return;
        async function checkVerified() {
            const data = await isUserVerified();
            const userToken = getLS(LS_USER_VERIFY_TOKEN, address);
            setUserVrfToken(userToken ? userToken : '');
            if (!data) return;
            setIsVerified(userToken == data.vrfTkn && data.vrfTkn != null);
        }

        checkVerified();

        // if (!areSubscriptionsEnabled || !isChatOpen) return;

        async function getRest() {
            if (freezePanel) freezePanel();
            const data =
                room === 'Admins'
                    ? await getAllMessages(0)
                    : await getMsgWithRest(room);
            setMessages(data.reverse());
            if (data.length > 0) {
                if (data[data.length - 1]) {
                    setLastMessage(data[data.length - 1]);
                    setMessageUser(data[data.length - 1].sender);
                }
            }

            const userListData = await getUserListWithRest();
            const usmp = new Map<string, User>();
            userListData.forEach((user: User) => {
                usmp.set(user._id, user);
            });
            setUserMap(usmp);
            setUsers(userListData);
            if (activatePanel) activatePanel();
        }

        getRest();
    }, [room, areSubscriptionsEnabled, isChatOpen, address, notifications]);

    useEffect(() => {
        if (roomRef.current == room) return;
        sendToSocket('join-room', { roomInfo: room, oldRoom: roomRef.current });
        roomRef.current = room;
    }, [room]);

    useEffect(() => {
        updateUserCache();
    }, [messages]);

    async function deleteMsgFromList(msgId: string) {
        const payload = {
            _id: msgId,
            whoIsDeleting: currentUserID,
            verifyToken: getUserVerifyToken(address),
        };
        const response = await fetch(
            `${CHAT_BACKEND_URL}/chat/api/messages/deleteMessagev2`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            },
        );
        activateToastr('Message deleted successfully', 'success');
        const data = await response.json();
        data.message.deletedMessageText = 'This message has deleted';
        if (data) {
            const msg = data.message;
            sendToSocket('message-deleted', { ...data.message });
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
        const payload = {
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
            senderToken: userVrfToken,
        };

        sendToSocket('send-msg', payload);
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
        sendToSocket('message-updated', { ...data.data.message });

        return data;
    }

    // update messages list with new message from server
    const updateMessages = (message: any) => {
        let newMessageList = messages.map((e) => {
            if (e._id == message._id) {
                return message;
            } else {
                return e;
            }
        });
        newMessageList = newMessageList.filter(
            (e) => e.isDeleted != true || room == 'Admins',
        );
        setMessages([...newMessageList]);
    };

    // updates messages list with new message list from server
    const updateMessageWithArr = (msgListFromServer: Message[]) => {
        const newVerifiedMsgIds = new Set(
            msgListFromServer.map((msg) => msg._id),
        );
        let newMessageList = messages.map((e) => {
            if (newVerifiedMsgIds.has(e._id)) {
                return {
                    ...e,
                    isVerified: true,
                };
            } else {
                return e;
            }
        });
        newMessageList = newMessageList.filter(
            (e) => e.isDeleted != true || room == 'Admins',
        );
        setMessages([...newMessageList]);
    };

    async function updateUserWithAvatarImage(
        userId: string,
        walletID: string,
        avatarImage: string,
        avatarThumbnail?: string,
        avatarCompressed?: string,
    ) {
        sendToSocket('set-avatar', {
            userId,
            walletID,
            avatarImage,
            avatarThumbnail,
            avatarCompressed,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function userListLightUpdate(data: any) {
        const newUsersList: User[] = [];

        let refreshMessages = false;
        users.map((e) => {
            if (e._id == data.userId) {
                newUsersList.push({ ...e, avatarImage: data.avatarImage });
                refreshMessages = true;
            } else {
                newUsersList.push({ ...e });
            }
        });

        if (!refreshMessages) return;

        setUsers(newUsersList);

        const usmp = new Map<string, User>();
        newUsersList.forEach((user: User) => {
            usmp.set(user._id, user);
        });
        setUserMap(usmp);
        setMessages([...messagesRef.current]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handlePossibleAvatarChange(data: any) {
        if (data.walletID) {
            updateUserAvatarData(data.walletID, {
                avatarImage: data.avatarImage,
                avatarThumbnail: data.avatarThumbnail,
                avatarCompressed: data.avatarCompressed,
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMsgListener = (data: any) => {
        if (data.roomInfo !== room && room != 'Admins') return;
        if (
            data &&
            data.sender &&
            data.sender === currentUserID &&
            !data.isVerified
        ) {
            let nonVrfMessages = getLS(LS_USER_NON_VERIFIED_MESSAGES, address);
            const newMsgToken = ', ' + data._id;
            nonVrfMessages = nonVrfMessages
                ? (nonVrfMessages += newMsgToken)
                : data._id + '';
            setLS(LS_USER_NON_VERIFIED_MESSAGES, nonVrfMessages, address);
        }
        setMessages([...messagesRef.current, data]);
        if (messagesRef.current[messagesRef.current.length - 1]) {
            setLastMessage(data);
            setMessageUser(data.sender);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deletedMsgListener = (data: any) => {
        updateMessages(data);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedMsgListener = (data: any) => {
        updateMessages(data);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notiListener = (data: any) => {
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
    };

    const addListener = (listener: ChatSocketListener) => {
        if (!listeners.some((e) => e.componentId === listener.componentId)) {
            setListeners([...listeners, listener]);
        }
    };

    return {
        messages,
        sendMsg,
        lastMessage,
        messageUser,
        users,
        notifications,
        updateLikeDislike,
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
        fetchForNotConnectedUser,
        getUserSummaryDetails,
        updateUnverifiedMessages,
        getMentionsWithRest,
        updateUserWithAvatarImage,
        addListener,
    };
};

export default useChatSocket;

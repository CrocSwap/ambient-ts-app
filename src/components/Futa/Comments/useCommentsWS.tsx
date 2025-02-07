/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any  */

import {
    // Dispatch,
    // SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { CHAT_BACKEND_URL } from '../../../ambient-utils/constants';

import {
    decodeSocketIOMessage,
    encodeSocketIOMessage,
    getLS,
    getUserVerifyToken,
    setLS,
} from '../../Chat/ChatUtils';

import {
    addReactionEndpoint,
    getMessageWithRestEndpoint,
    getMessageWithRestWithPaginationEndpoint,
    getUserDetailsEndpoint,
    getUserIsVerified,
    getUserListWithRestEndpoint,
    updateVerifiedDateEndpoint,
    verifyUserEndpoint,
} from '../../Chat/ChatConstants/ChatEndpoints';

import useWebSocket, { ReadyState } from 'react-use-websocket';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import {
    LS_USER_NON_VERIFIED_MESSAGES,
    LS_USER_VERIFY_TOKEN,
} from '../../Chat/ChatConstants/ChatConstants';
import { ChatWsQueryParams } from '../../Chat/ChatIFs';
import { Message } from '../../Chat/Model/MessageModel';
import { User } from '../../Chat/Model/UserModel';

type ChatSocketListener = {
    msg: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (payload: any) => void;
    componentId: string;
};

const useCommentsWS = (
    room: string,
    fetchListener: () => void,
    currentUserID?: string,
) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [lastMessage, setLastMessage] = useState<Message>();
    const [messageUser, setMessageUser] = useState<string>();
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [userMap, setUserMap] = useState<Map<string, User>>(
        new Map<string, User>(),
    );
    const [userVrfToken, setUserVrfToken] = useState<string>('');

    const roomRef = useRef<string>(room);

    const messagesRef = useRef<Message[]>([]);
    const [listeners, setListeners] = useState<ChatSocketListener[]>([]);

    messagesRef.current = messages;

    const { userAddress: address, ensName } = useContext(UserDataContext);
    const { isUserIdle } = useContext(AppStateContext);

    const offlineFetcherMS = 3000;
    const [offlineFetcher, setOfflineFetcher] = useState<NodeJS.Timeout>();
    const offlineFetcherRef = useRef<NodeJS.Timeout>();
    offlineFetcherRef.current = offlineFetcher;

    const url = CHAT_BACKEND_URL + '/chat/api/subscribe/';

    // handle query params
    const qp: ChatWsQueryParams = {
        roomId: room,
    };
    if (address && address.length > 0) {
        qp.address = address.toString();
    }
    if (ensName && ensName.length > 0) {
        qp.ensName = ensName;
    }

    const {
        lastMessage: socketLastMessage,
        sendMessage: socketSendMessage,
        readyState,
    } = useWebSocket(!isUserIdle && address ? url : null, {
        queryParams: {
            roomId: qp.roomId,
            address: qp.address ? qp.address : '',
            ensName: qp.ensName ? qp.ensName : '',
        },
        fromSocketIO: true,
        shouldReconnect: () => true,
        reconnectAttempts: 20,
        reconnectInterval: (attemptNumber) =>
            Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
        share: true,
        onOpen: () => {
            doHandshake();
        },
        heartbeat: {
            interval: 60000,
            timeout: 55000,
        },
    });

    const isWsConnected = readyState == ReadyState.OPEN;

    useEffect(() => {
        return () => {
            clearInterval(offlineFetcherRef.current);
        };
    }, []);

    useEffect(() => {
        doHandshake();
    }, [address, ensName, room, offlineFetcher]);

    useEffect(() => {
        doHandshake();
        if (!isUserIdle) {
            fetchForNotConnectedUser();
        }
    }, [isUserIdle]);

    useEffect(() => {
        fetchMessages();

        // set up a trigger to fetch messages for offline users
        if (!address) {
            const newInt = setInterval(() => {
                if (offlineFetcherRef.current) {
                    fetchForNotConnectedUser();
                }
            }, offlineFetcherMS);

            offlineFetcherRef.current = newInt;
            setOfflineFetcher(newInt);
        } else {
            // clear trigger once user is connected
            clearInterval(offlineFetcherRef.current);
        }

        return () => {
            clearInterval(offlineFetcherRef.current);
        };
    }, [room, address]);

    useEffect(() => {
        if (socketLastMessage == null || socketLastMessage.data == null) return;
        const decoded = decodeSocketIOMessage(socketLastMessage.data);
        switch (decoded.msgType) {
            case 'msg-recieve-2':
                newMsgListener(decoded.payload);
                break;
            case 'message-deleted-listener':
                deletedMsgListener(decoded.payload);
                break;
            case 'message-updated-listener':
                updatedMsgListener(decoded.payload);
                break;
        }
    }, [socketLastMessage]);

    const doHandshake = () => {
        sendToSocket('handshake-update', {
            roomId: room,
            address: address,
            ensName: ensName,
        });
    };

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
        assignMessages(data.reverse());
        setLastMessage(data);
        setMessageUser(data.sender);
        return data.reverse();
    }

    async function fetchForNotConnectedUser() {
        const encodedRoomInfo = encodeURIComponent(roomRef.current);
        const url = `${CHAT_BACKEND_URL}${getMessageWithRestEndpoint}${encodedRoomInfo}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();

        const unreads: Message[] = [];
        data.reverse().forEach((msg: Message) => {
            if (!messagesRef.current.some((m2) => m2._id == msg._id)) {
                msg.isUnread = true;
                unreads.push(msg);
            } else {
                return;
            }
        });
        if (unreads.length > 0) {
            assignMessages([...messagesRef.current, ...unreads]);
            setUnreadMessages(unreads);
        } else {
            return;
        }
    }

    async function getMsgWithRestWithPagination(roomInfo: string, p?: number) {
        const encodedRoomInfo = encodeURIComponent(roomInfo);
        const queryParams = 'p=' + p;
        const url = `${CHAT_BACKEND_URL}${getMessageWithRestWithPaginationEndpoint}${encodedRoomInfo}?${queryParams}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        const data = await response.json();
        assignMessages([...data.reverse(), ...messages]);
        setLastMessage(data);
        setMessageUser(data.sender);

        return data.reverse();
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
            const userToken = getLS(LS_USER_VERIFY_TOKEN, address);
            if (!userToken) return false;
            const encodedAddress = encodeURIComponent(address);
            let encodedToken = '';
            if (userToken && userToken.length > 20) {
                encodedToken = encodeURIComponent(userToken.substring(0, 20));
            }
            const response = await fetch(
                CHAT_BACKEND_URL +
                    getUserIsVerified +
                    encodedAddress +
                    '/' +
                    encodedToken,
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

    async function fetchMessages() {
        if (room == '') return;
        setIsLoading(true);
        const data = await getMsgWithRest(room);
        assignMessages(data.reverse());
        if (data.length > 0) {
            if (data[data.length - 1]) {
                setLastMessage(data[data.length - 1]);
                setMessageUser(data[data.length - 1].sender);
            }
        }

        // const userListData = await getUserListWithRest();
        // const usmp = new Map<string, User>();
        // userListData.forEach((user: User) => {
        //     usmp.set(user._id, user);
        // });
        // setUserMap(usmp);
        // setUsers(userListData);

        setIsLoading(false);
        processFetchListener();
    }

    useEffect(() => {
        async function checkVerified() {
            const data = await isUserVerified();
            if (!data) return setIsVerified(false);
            setIsVerified(data.verified);
        }

        checkVerified();

        // if (isUserIdle == false) {
        //     fetchMessages();
        // }
    }, [room, address, isUserIdle]);

    useEffect(() => {
        if (roomRef.current == room) return;
        sendToSocket('join-room', { roomInfo: room, oldRoom: roomRef.current });
        roomRef.current = room;
    }, [room]);

    // useEffect(() => {
    //     updateUserCache();
    // }, [messages]);

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
        const data = await response.json();
        if (data && data.status == 'OK') {
            // activateToastr('Message deleted successfully', 'success');
            data.message.deletedMessageText = 'This message has deleted';
            if (data) {
                const msg = data.message;
                sendToSocket('message-deleted', { ...data.message });
                const newMessageList = messages.map((e) => {
                    if (e && e._id == msg._id) {
                        return msg;
                    } else {
                        return e;
                    }
                });

                assignMessages([...newMessageList]);
            }
        } else {
            // activateToastr(data.status, 'error');
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
        chainId: string | null,
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
            chainId,
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
            if (e && e._id == message._id) {
                return message;
            } else {
                return e;
            }
        });
        newMessageList = newMessageList.filter(
            (e) => (e && e.isDeleted != true) || room == 'Admins',
        );
        assignMessages([...newMessageList]);
    };

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
        data.isUnread = true;
        assignMessages([...messagesRef.current, data]);
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

    const addListener = (listener: ChatSocketListener) => {
        if (!listeners.some((e) => e.componentId === listener.componentId)) {
            setListeners([...listeners, listener]);
        }
    };

    const assignMessages = (messages: Message[]) => {
        setMessages(messages.filter((m) => m != null));
    };

    const processFetchListener = () => {
        if (fetchListener != undefined) {
            setTimeout(() => {
                fetchListener();
            }, 5);
        }
    };

    const markAsRead = (messageId: string) => {
        console.log('mark as read', messageId);
        const newMessages = messages.map((msg) => {
            if (msg._id === messageId) {
                return { ...msg, isUnread: false };
            }
            return msg;
        });
        setMessages(newMessages);
    };

    return {
        messages,
        sendMsg,
        lastMessage,
        messageUser,
        users,
        isVerified,
        verifyUser,
        userMap,
        updateVerifyDate,
        updateUserCache,
        getMsgWithRestWithPagination,
        deleteMsgFromList,
        setMessages,
        addReaction,
        fetchForNotConnectedUser,
        getUserSummaryDetails,
        addListener,
        isWsConnected,
        isLoading,
        unreadMessages,
        markAsRead,
    };
};

export default useCommentsWS;

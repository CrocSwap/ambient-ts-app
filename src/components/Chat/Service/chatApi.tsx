// import { useEffect } from 'react';
import io from 'socket.io-client';
import { connect } from 'tls';

export const host = 'http://localhost:5000';
export const client = 'http://localhost:3000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;

// export const socket = io(sendMessageRoute);
export const socket = io(host);

// const [isConnected, setIsConnected] = useState(socket.connected);
// const [lastPong, setLastPong] = useState(null);

// export const connect=() => {
//     socket.on('connect', () => {
//         setIsConnected(true);
//       });
// }

// const handleSendMsg = async (msg:any) => {
//     socket.current.emit('send-msg', {
//       to: '',
//       from: '',
//       msg,
//     });

//     await axios.post(sendMessageRoute, {
//       from: '',
//       to: '',
//       message: msg,
//     });

//     const msgs = [];
//     msgs.push({ fromSelf: true, message: msg });
//     setMessages(msgs);
//   };

// export const disconnect=() => {
//     socket.on('disconnect', () => {
//         setIsConnected(false);
//       });
// }

// export const getMessages=() => {

// }

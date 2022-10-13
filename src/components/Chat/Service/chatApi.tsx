// import { useEffect } from 'react';
import io from 'socket.io-client';

export const host = 'http://localhost:5000';
export const client = 'http://localhost:3000';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

export const socket = io(host);

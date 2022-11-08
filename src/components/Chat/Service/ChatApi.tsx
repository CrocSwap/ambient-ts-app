import React, { useEffect, useContext, useState, SetStateAction, Dispatch, useRef } from 'react';
import { targetData } from '../../../utils/state/tradeDataSlice';
import { PoolIF } from '../../../utils/interfaces/PoolIF';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { Message } from '../Model/MessageModel';
import { useMoralis } from 'react-moralis';
export const host = 'https://crocswap-chat.herokuapp.com';
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getall`;
export const recieveMessageByRoomRoute = `${host}/api/messages/getmsgbyroom`;
export const receiveUsername = `${host}/api/auth/getUserByUsername`;
export const accountName = `${host}/api/auth/getUserByAccount`;

interface currentPoolInfo {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    didUserFlipDenom: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
    limitPrice: string;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
    pinnedMaxPriceDisplayTruncated: number;
    pinnedMinPriceDisplayTruncated: number;
}
interface ChatProps {
    chatStatus: boolean;
    onClose: () => void;
    favePools: PoolIF[];
    currentPool: currentPoolInfo;
    isFullScreen?: boolean;
    setChatStatus: Dispatch<SetStateAction<boolean>>;
}

const useChatApi = () => {
    const { account, isWeb3Enabled, isAuthenticated } = useMoralis();

    async function getID() {
        if (account) {
            const response = await fetch(
                'https://crocswap-chat.herokuapp.com/api/auth/getUserByAccount/' + account,
                {
                    method: 'GET',
                },
            );
            const data = await response.json();
            if (data.status === 'OK') {
                return data;
            } else {
                console.error('else', data);
                return data;
            }
        }
    }

    async function getNameOrWallet(_id: string) {
        const response = await fetch(
            'https://crocswap-chat.herokuapp.com/api/auth/getUserByAccount/' + _id,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        if (data.ensName === '') {
            return data.walletID;
        } else {
            return data.ensName;
        }
    }

    return { getID, getNameOrWallet };
};
export default useChatApi;

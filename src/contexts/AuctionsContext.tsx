import React, { createContext, useContext, useEffect, useState } from 'react';
// import { fetchAuctionsData } from '../ambient-utils/api';
import { CrocEnvContext } from './CrocEnvContext';
import {
    mockAccountData,
    mockAuctionData,
} from '../pages/platformFuta/mockAuctionData';
import { UserDataContext } from './UserDataContext';

interface AuctionsContextIF {
    auctions: AuctionsDataIF;
    accountData: AccountDataIF;
    getAuctions(): void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    showComments: boolean;
    setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
    tickerInput: string;
    setTickerInput: React.Dispatch<React.SetStateAction<string>>;
}

export interface AuctionDataIF {
    ticker: string;
    marketCap: number;
    createdAt: number;
    status?: null;
}

export interface AuctionsDataIF {
    dataReceived: boolean;
    chainId: string;
    data: AuctionDataIF[];
}

export interface AccountDataIF {
    dataReceived: boolean;
    chainId: string;
    auctions: AuctionDataIF[];
}
// export interface AuctionsDataIF {
//     global: XpLeaderboardDataIF;
//     byWeek: XpLeaderboardDataIF;
//     byChain: XpLeaderboardDataIF;
//     getAuctions: (xpLeaderboardType: string) => void;
// }

export interface AuctionIF {
    status: string;
}

export const AuctionsContext = createContext<AuctionsContextIF>(
    {} as AuctionsContextIF,
);

export const AuctionsContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);

    const [auctionsData, setAuctionsData] = React.useState<AuctionsDataIF>({
        dataReceived: false,
        chainId: chainId,
        data: [],
    });

    const [accountData, setAccountData] = React.useState<AccountDataIF>({
        dataReceived: false,
        chainId: chainId,
        auctions: [],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [tickerInput, setTickerInput] = useState('');
    const [showComments, setShowComments] = useState(false);

    // const [auctionsGlobal, setAuctionsGlobal] =
    //     React.useState<XpLeaderboardDataIF>({
    //         dataReceived: false,
    //         data: undefined,
    //     });
    // const [auctionsByWeek, setAuctionsByWeek] =
    //     React.useState<XpLeaderboardDataIF>({
    //         dataReceived: false,
    //         data: undefined,
    //     });
    // const [auctionsByChain, setAuctionsByChain] =
    //     React.useState<XpLeaderboardDataIF>({
    //         dataReceived: false,
    //         data: undefined,
    //     });

    const fetchAuctionsData = async () => {
        return mockAuctionData;
    };

    const fetchAccountData = async () => {
        return mockAccountData;
    };

    function getAuctionsData() {
        console.log('getAuctions');
        fetchAuctionsData().then((data) => {
            setAuctionsData({
                dataReceived: true,
                chainId: chainId,
                data: data,
            });
        });
    }

    function getAccountData() {
        console.log('getAccount');
        fetchAccountData().then((data) => {
            setAccountData({
                dataReceived: true,
                chainId: chainId,
                auctions: data,
            });
        });
    }

    // useEffect to fetch auctions  data every 30 seconds
    useEffect(() => {
        getAuctionsData();
        const interval = setInterval(() => {
            getAuctionsData();
        }, 30000);
        return () => clearInterval(interval);
    }, [chainId]);

    // useEffect to fetch account data every 30 seconds
    useEffect(() => {
        getAccountData();
        const interval = setInterval(() => {
            getAccountData();
        }, 30000);
        return () => clearInterval(interval);
    }, [chainId, userAddress]);

    const auctionsContext: AuctionsContextIF = {
        auctions: {
            dataReceived: auctionsData.dataReceived,
            chainId: chainId,
            data: auctionsData.data || [],
        },
        accountData: {
            dataReceived: accountData.dataReceived,
            chainId: chainId,
            auctions: accountData.auctions || [],
        },
        getAuctions: getAuctionsData,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        tickerInput: tickerInput,
        setTickerInput: setTickerInput,
        showComments: showComments,
        setShowComments: setShowComments,
    };

    return (
        <AuctionsContext.Provider value={auctionsContext}>
            {props.children}
        </AuctionsContext.Provider>
    );
};

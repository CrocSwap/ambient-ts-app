import React, { createContext, useContext, useEffect, useState } from 'react';
// import { fetchAuctionsData } from '../ambient-utils/api';
import { CrocEnvContext } from './CrocEnvContext';
import {
    mockAccountData,
    mockAuctionData,
    mockAuctionDetailsServerResponseGenerator,
} from '../pages/platformFuta/mockAuctionData';
import { UserDataContext } from './UserDataContext';
import {
    tickerVersions,
    tickerWatchlistIF,
    useTickerWatchlist,
} from '../pages/platformFuta/useTickerWatchlist';

interface AuctionsContextIF {
    auctions: AuctionsDataIF;
    accountData: AccountDataIF;
    getAuctions(): void;
    getAuctionData(ticker: string): void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    showComments: boolean;
    setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
    tickerInput: string;
    setTickerInput: React.Dispatch<React.SetStateAction<string>>;
    auctionStatusData: AuctionStatusDataIF;
    selectedTicker: string | undefined;
    setSelectedTicker: React.Dispatch<React.SetStateAction<string | undefined>>;
    watchlists: Record<tickerVersions, tickerWatchlistIF>;
    showComplete: boolean;
    setShowComplete: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AuctionDataIF {
    ticker: string;
    createdAt: number;
    auctionLength: number;
    highestFilledBidInEth: number;
    highestBidByUserInEth?: number;
    userBidSizeUserInEth?: number;
    tokenAllocationUnclaimedByUser?: number;
    ethUnclaimedByUser?: number;
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

export interface AuctionStatusDataServerIF {
    ticker: string;
    createdAt: number;
    auctionLength: number;
    highestFilledBidInEth: number;
    openBidInEth?: number | undefined;
    openBidAmountFilledInEth?: number | undefined;
}

export interface AuctionStatusDataIF {
    dataReceived: boolean;
    ticker: string;
    createdAt: number;
    auctionLength: number;
    chainId: string;
    highestFilledBidInEth: number;
    openBidInEth: number | undefined;
    openBidAmountFilledInEth: number | undefined;
}

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

    const [auctionStatusData, setAuctionStatusData] =
        React.useState<AuctionStatusDataIF>({
            dataReceived: false,
            ticker: '',
            createdAt: 0,
            auctionLength: 0,
            chainId: chainId,
            highestFilledBidInEth: 0.25,
            openBidInEth: undefined,
            openBidAmountFilledInEth: undefined,
        });

    const [isLoading, setIsLoading] = useState(true);
    const [tickerInput, setTickerInput] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showComplete, setShowComplete] = useState<boolean>(false);

    const [selectedTicker, setSelectedTicker] = useState<string | undefined>();

    const fetchAuctionsData = async () => {
        return mockAuctionData;
    };

    const fetchAccountData = async () => {
        return mockAccountData;
    };

    const fetchAuctionStatusData = async (
        ticker: string,
    ): Promise<AuctionStatusDataServerIF> => {
        return mockAuctionDetailsServerResponseGenerator(ticker);
    };

    function getAuctionsData() {
        fetchAuctionsData().then((data) => {
            setAuctionsData({
                dataReceived: true,
                chainId: chainId,
                data: data,
            });
        });
    }

    function getAccountData() {
        fetchAccountData().then((data) => {
            setAccountData({
                dataReceived: true,
                chainId: chainId,
                auctions: data,
            });
        });
    }

    function getAuctionData(ticker: string) {
        fetchAuctionStatusData(ticker).then((data) => {
            setAuctionStatusData({
                dataReceived: true,
                ticker: data.ticker,
                createdAt: data.createdAt,
                auctionLength: data.auctionLength,
                chainId: chainId,
                highestFilledBidInEth: data.highestFilledBidInEth,
                openBidInEth: data.openBidInEth,
                openBidAmountFilledInEth: data.openBidAmountFilledInEth,
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

    // hook managing ticker watchlists for each FUTA version
    const watchlistV1: tickerWatchlistIF = useTickerWatchlist('v1', [
        'JUNIOR1',
        'PEPE1',
        'DEGEN2',
        'EMILY3',
    ]);

    const auctionsContext: AuctionsContextIF = {
        auctionStatusData: auctionStatusData,
        auctions: auctionsData,
        accountData: accountData,
        getAuctions: getAuctionsData,
        getAuctionData: getAuctionData,
        isLoading: isLoading,
        setIsLoading: setIsLoading,
        tickerInput: tickerInput,
        setTickerInput: setTickerInput,
        showComments: showComments,
        setShowComments: setShowComments,
        selectedTicker: selectedTicker,
        setSelectedTicker: setSelectedTicker,
        watchlists: {
            v1: watchlistV1,
        },
        showComplete: showComplete,
        setShowComplete: setShowComplete,
    };

    return (
        <AuctionsContext.Provider value={auctionsContext}>
            {props.children}
        </AuctionsContext.Provider>
    );
};

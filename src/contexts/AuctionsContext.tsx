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

// interface for auction data used to generate tables
export interface AuctionDataIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: number; // string

    // user specific data received for account queries
    userBidClearingPriceInNativeTokenWei?: number | undefined; // string
    qtyBidByUserInNativeTokenWei?: number | undefined; // string
    qtyUnclaimedByUserInAuctionedTokenWei?: number | undefined; // string
    qtyClaimedByUserInAuctionedTokenWei?: number | undefined; // string
    qtyUnreturnedToUserInNativeTokenWei?: number | undefined; // string
    qtyReturnedToUserInNativeTokenWei?: number | undefined; // string
}

// interface for auction status data used to generate auction details view
export interface AuctionStatusDataServerIF {
    ticker: string;
    chainId: string;
    createdAt: number;
    auctionLength: number;
    filledClearingPriceInNativeTokenWei: number; // string

    // open bid data
    openBidClearingPriceInNativeTokenWei?: number | undefined; // string
    openBidQtyFilledInNativeTokenWei?: number | undefined; // string
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

export interface AuctionStatusDataIF {
    dataReceived: boolean;
    ticker: string;
    createdAt: number;
    auctionLength: number;
    chainId: string;
    filledClearingPriceInNativeTokenWei: number;
    openBidClearingPriceInNativeTokenWei: number | undefined;
    openBidQtyFilledInNativeTokenWei: number | undefined;
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
            filledClearingPriceInNativeTokenWei: 0.25,
            openBidClearingPriceInNativeTokenWei: undefined,
            openBidQtyFilledInNativeTokenWei: undefined,
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
        return mockAuctionDetailsServerResponseGenerator(ticker, chainId);
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
                filledClearingPriceInNativeTokenWei:
                    data.filledClearingPriceInNativeTokenWei,
                openBidClearingPriceInNativeTokenWei:
                    data.openBidClearingPriceInNativeTokenWei,
                openBidQtyFilledInNativeTokenWei:
                    data.openBidQtyFilledInNativeTokenWei,
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

import React, { createContext, useContext, useEffect, useState } from 'react';
// import { fetchAuctionsData } from '../ambient-utils/api';
import { CrocEnvContext } from './CrocEnvContext';
import { mockAuctionData } from '../pages/platformFuta/mockAuctionData';

interface AuctionsContextIF {
    auctions: AuctionsDataIF;
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
    data: AuctionDataIF[] | undefined;
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

    const [auctionsData, setAuctionsData] = React.useState<AuctionsDataIF>({
        dataReceived: false,
        chainId: chainId,
        data: undefined,
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

    function getAuctions() {
        fetchAuctionsData().then((data) => {
            setAuctionsData({
                dataReceived: true,
                chainId: chainId,
                data: data,
            });
        });
    }

    // useEffect to fetch auctions data every 30 seconds
    useEffect(() => {
        getAuctions();
        const interval = setInterval(() => {
            getAuctions();
        }, 30000);
        return () => clearInterval(interval);
    }, [chainId]);

    const auctionsContext: AuctionsContextIF = {
        auctions: {
            dataReceived: auctionsData.dataReceived,
            chainId: chainId,
            data: auctionsData.data,
        },
        getAuctions: getAuctions,
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

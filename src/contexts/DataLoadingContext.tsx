import React, { createContext, useState } from 'react';

interface DataLoadingContextIF {
    isConnectedUserTxDataLoading: boolean;
    isConnectedUserOrderDataLoading: boolean;
    isConnectedUserPoolOrderDataLoading: boolean;
    isConnectedUserRangeDataLoading: boolean;
    isConnectedUserPoolRangeDataLoading: boolean;
    isLookupUserTxDataLoading: boolean;
    isLookupUserOrderDataLoading: boolean;
    isLookupUserRangeDataLoading: boolean;
    isPoolTxDataLoading: boolean;
    isPoolOrderDataLoading: boolean;
    isPoolRangeDataLoading: boolean;
    isCandleDataLoading: boolean;
    setDataLoadingStatus: (params: {
        datasetName: keyof DataLoadingContextIF;
        loadingStatus: boolean;
    }) => void;
}

export const DataLoadingContext = createContext<DataLoadingContextIF>(
    {} as DataLoadingContextIF,
);

export const DataLoadingContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [isConnectedUserTxDataLoading, setIsConnectedUserTxDataLoading] =
        useState(false);
    const [
        isConnectedUserOrderDataLoading,
        setIsConnectedUserOrderDataLoading,
    ] = useState(false);
    const [
        isConnectedUserPoolOrderDataLoading,
        setIsConnectedUserPoolOrderDataLoading,
    ] = useState(false);
    const [
        isConnectedUserRangeDataLoading,
        setIsConnectedUserRangeDataLoading,
    ] = useState(false);
    const [
        isConnectedUserPoolRangeDataLoading,
        setIsConnectedUserPoolRangeDataLoading,
    ] = useState(false);
    const [isLookupUserTxDataLoading, setIsLookupUserTxDataLoading] =
        useState(false);
    const [isLookupUserOrderDataLoading, setIsLookupUserOrderDataLoading] =
        useState(false);
    const [isLookupUserRangeDataLoading, setIsLookupUserRangeDataLoading] =
        useState(false);
    const [isPoolTxDataLoading, setIsPoolTxDataLoading] = useState(false);
    const [isPoolOrderDataLoading, setIsPoolOrderDataLoading] = useState(false);
    const [isPoolRangeDataLoading, setIsPoolRangeDataLoading] = useState(false);
    const [isCandleDataLoading, setIsCandleDataLoading] = useState(false);

    const setDataLoadingStatus = (params: {
        datasetName: keyof DataLoadingContextIF;
        loadingStatus: boolean;
    }) => {
        const { datasetName, loadingStatus } = params;

        switch (datasetName) {
            case 'isConnectedUserTxDataLoading':
                setIsConnectedUserTxDataLoading(loadingStatus);
                break;
            case 'isConnectedUserOrderDataLoading':
                setIsConnectedUserOrderDataLoading(loadingStatus);
                break;
            case 'isConnectedUserPoolOrderDataLoading':
                setIsConnectedUserPoolOrderDataLoading(loadingStatus);
                break;
            case 'isConnectedUserRangeDataLoading':
                setIsConnectedUserRangeDataLoading(loadingStatus);
                break;
            case 'isConnectedUserPoolRangeDataLoading':
                setIsConnectedUserPoolRangeDataLoading(loadingStatus);
                break;
            case 'isLookupUserTxDataLoading':
                setIsLookupUserTxDataLoading(loadingStatus);
                break;
            case 'isLookupUserOrderDataLoading':
                setIsLookupUserOrderDataLoading(loadingStatus);
                break;
            case 'isLookupUserRangeDataLoading':
                setIsLookupUserRangeDataLoading(loadingStatus);
                break;
            case 'isPoolTxDataLoading':
                setIsPoolTxDataLoading(loadingStatus);
                break;
            case 'isPoolOrderDataLoading':
                setIsPoolOrderDataLoading(loadingStatus);
                break;
            case 'isPoolRangeDataLoading':
                setIsPoolRangeDataLoading(loadingStatus);
                break;
            case 'isCandleDataLoading':
                setIsCandleDataLoading(loadingStatus);
                break;
        }
    };

    const dataLoadingContext: DataLoadingContextIF = {
        isConnectedUserTxDataLoading,
        isConnectedUserOrderDataLoading,
        isConnectedUserPoolOrderDataLoading,
        isConnectedUserRangeDataLoading,
        isConnectedUserPoolRangeDataLoading,
        isLookupUserTxDataLoading,
        isLookupUserOrderDataLoading,
        isLookupUserRangeDataLoading,
        isPoolTxDataLoading,
        isPoolOrderDataLoading,
        isPoolRangeDataLoading,
        isCandleDataLoading,
        setDataLoadingStatus,
    };
    return (
        <DataLoadingContext.Provider value={dataLoadingContext}>
            {props.children}
        </DataLoadingContext.Provider>
    );
};

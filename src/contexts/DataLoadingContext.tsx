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
    resetPoolDataLoadingStatus: () => void;
    resetConnectedUserDataLoadingStatus: () => void;
}

export const DataLoadingContext = createContext<DataLoadingContextIF>(
    {} as DataLoadingContextIF,
);

export const DataLoadingContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [isConnectedUserTxDataLoading, setIsConnectedUserTxDataLoading] =
        useState(true);
    const [
        isConnectedUserOrderDataLoading,
        setIsConnectedUserOrderDataLoading,
    ] = useState(true);
    const [
        isConnectedUserPoolOrderDataLoading,
        setIsConnectedUserPoolOrderDataLoading,
    ] = useState(true);
    const [
        isConnectedUserRangeDataLoading,
        setIsConnectedUserRangeDataLoading,
    ] = useState(true);
    const [
        isConnectedUserPoolRangeDataLoading,
        setIsConnectedUserPoolRangeDataLoading,
    ] = useState(true);
    const [isLookupUserTxDataLoading, setIsLookupUserTxDataLoading] =
        useState(true);
    const [isLookupUserOrderDataLoading, setIsLookupUserOrderDataLoading] =
        useState(true);
    const [isLookupUserRangeDataLoading, setIsLookupUserRangeDataLoading] =
        useState(true);
    const [isPoolTxDataLoading, setIsPoolTxDataLoading] = useState(true);
    const [isPoolOrderDataLoading, setIsPoolOrderDataLoading] = useState(true);
    const [isPoolRangeDataLoading, setIsPoolRangeDataLoading] = useState(true);
    const [isCandleDataLoading, setIsCandleDataLoading] = useState(true);

    const resetPoolDataLoadingStatus = () => {
        setIsPoolTxDataLoading(true);
        setIsPoolOrderDataLoading(true);
        setIsPoolRangeDataLoading(true);
    };
    const resetConnectedUserDataLoadingStatus = () => {
        setIsConnectedUserTxDataLoading(true);
        setIsConnectedUserOrderDataLoading(true);
        setIsConnectedUserRangeDataLoading(true);
    };
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
        resetPoolDataLoadingStatus,
        resetConnectedUserDataLoadingStatus,
    };
    return (
        <DataLoadingContext.Provider value={dataLoadingContext}>
            {props.children}
        </DataLoadingContext.Provider>
    );
};

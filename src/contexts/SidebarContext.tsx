import { useMediaQuery } from '@material-ui/core';
import React, { createContext, useEffect, useMemo, useContext } from 'react';
import {
    recentPoolsMethodsIF,
    useRecentPools,
} from '../App/hooks/useRecentPools';
import { sidebarMethodsIF, useSidebar } from '../App/hooks/useSidebar';
import { IS_LOCAL_ENV } from '../constants';
import { diffHashSig } from '../utils/functions/diffHashSig';
import isJsonString from '../utils/functions/isJsonString';
import { useAppSelector } from '../utils/hooks/reduxToolkit';
import { AppStateContext } from './AppStateContext';
import { CrocEnvContext } from './CrocEnvContext';
import { TokenContext } from './TokenContext';

interface SidebarStateIF {
    recentPools: recentPoolsMethodsIF;
    sidebar: sidebarMethodsIF;
}

export const SidebarContext = createContext<SidebarStateIF>(
    {} as SidebarStateIF,
);

export const SidebarContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { chainData } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const { tradeData, receiptData } = useAppSelector((state) => state);
    const lastReceipt =
        receiptData.sessionReceipts.length > 0 &&
        isJsonString(receiptData.sessionReceipts[0])
            ? JSON.parse(receiptData.sessionReceipts[0])
            : null;
    const isLastReceiptSuccess = lastReceipt?.status === 1;
    const lastReceiptHash = useMemo(
        () => (lastReceipt ? diffHashSig(lastReceipt) : undefined),
        [lastReceipt],
    );

    const sidebar = useSidebar(location.pathname);
    // hook to manage recent pool data in-session
    const recentPools: recentPoolsMethodsIF = useRecentPools(
        chainData.chainId,
        tradeData.tokenA,
        tradeData.tokenB,
        tokens,
    );

    const sidebarState = {
        sidebar,
        recentPools,
    };

    useEffect(() => {
        if (lastReceiptHash) {
            IS_LOCAL_ENV && console.debug('new receipt to display');
            openSnackbar(
                lastReceipt
                    ? isLastReceiptSuccess
                        ? `Transaction ${lastReceipt.transactionHash} successfully completed`
                        : `Transaction ${lastReceipt.transactionHash} failed`
                    : '',
                isLastReceiptSuccess ? 'info' : 'warning',
            );
        }
    }, [lastReceiptHash]);

    return (
        <SidebarContext.Provider value={sidebarState}>
            {props.children}
        </SidebarContext.Provider>
    );
};

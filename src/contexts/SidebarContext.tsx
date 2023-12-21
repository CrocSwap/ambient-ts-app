import { useMediaQuery } from '@material-ui/core';
import {
    ReactNode,
    createContext,
    useEffect,
    useMemo,
    useContext,
    useState,
    useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
    recentPoolsMethodsIF,
    useRecentPools,
} from '../App/hooks/useRecentPools';
import { sidebarMethodsIF, useSidebar } from '../App/hooks/useSidebar';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import { diffHashSig, isJsonString } from '../ambient-utils/dataLayer';
import { AppStateContext } from './AppStateContext';
import { CrocEnvContext } from './CrocEnvContext';
import { ReceiptContext } from './ReceiptContext';

interface SidebarStateIF {
    recentPools: recentPoolsMethodsIF;
    sidebar: sidebarMethodsIF;
    hideOnMobile: boolean;
    toggleMobileModeVisibility: () => void;
}

export const SidebarContext = createContext<SidebarStateIF>(
    {} as SidebarStateIF,
);

export const SidebarContextProvider = (props: { children: ReactNode }) => {
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { chainData } = useContext(CrocEnvContext);

    const { sessionReceipts } = useContext(ReceiptContext);

    const lastReceipt =
        sessionReceipts.length > 0 && isJsonString(sessionReceipts[0])
            ? JSON.parse(sessionReceipts[0])
            : null;
    const isLastReceiptSuccess = lastReceipt?.status === 1;
    const lastReceiptHash = useMemo(
        () => (lastReceipt ? diffHashSig(lastReceipt) : undefined),
        [lastReceipt],
    );

    const { pathname: currentLocation } = useLocation();

    const sidebar = useSidebar(location.pathname);

    // hook to manage recent pool data in-session
    const recentPools: recentPoolsMethodsIF = useRecentPools(chainData.chainId);
    const smallScreen = useMediaQuery('(max-width: 500px)');

    const [hideOnMobile, setHideOnMobile] = useState<boolean>(true);

    useEffect(() => {
        setHideOnMobile(smallScreen);
    }, [smallScreen]);
    const toggleMobileModeVisibility = () => setHideOnMobile((prev) => !prev);

    const sidebarState = {
        sidebar,
        recentPools,
        hideOnMobile,
        toggleMobileModeVisibility,
    };

    const showSidebarByDefault = useMediaQuery('(min-width: 1850px)');

    const toggleSidebarBasedOnRoute = useCallback(() => {
        if (sidebar.getStoredStatus() === 'open') {
            sidebar.open(true);
        } else if (
            currentLocation === '/' ||
            currentLocation === '/swap' ||
            currentLocation.includes('/account')
        ) {
            sidebar.close();
        } else if (showSidebarByDefault || smallScreen) {
            sidebar.open();
        } else {
            sidebar.close();
        }
    }, [currentLocation, showSidebarByDefault, sidebar, smallScreen]);

    useEffect(() => {
        toggleSidebarBasedOnRoute();
    }, [showSidebarByDefault, toggleSidebarBasedOnRoute]);

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
    }, [isLastReceiptSuccess, lastReceipt, lastReceiptHash, openSnackbar]);

    return (
        <SidebarContext.Provider value={sidebarState}>
            {props.children}
        </SidebarContext.Provider>
    );
};

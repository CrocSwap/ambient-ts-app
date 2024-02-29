import { useMediaQuery } from '@material-ui/core';
import {
    ReactNode,
    createContext,
    useEffect,
    useMemo,
    useContext,
    useState,
} from 'react';
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
import { TransactionReceipt } from '@ethersproject/abstract-provider';

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
    // logic to open a snackbar notification
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    // data on the active chain in the app
    const { chainData } = useContext(CrocEnvContext);

    // all receipts stored in the current user session (array of stringified JSONs)
    const { allReceipts } = useContext(ReceiptContext);

    // parsed JSON on the most recent receipt in the stack
    const lastReceipt: TransactionReceipt | null =
        allReceipts.length > 0 && isJsonString(allReceipts[0])
            ? JSON.parse(allReceipts[0])
            : null;

    // boolean representing whether most recent receipt parsed successfully
    const isLastReceiptSuccess: boolean = lastReceipt?.status === 1;

    // hash representation of the most recent receipt
    const lastReceiptHash = useMemo<string | undefined>(
        () => (lastReceipt ? diffHashSig(lastReceipt) : undefined),
        [lastReceipt],
    );

    // determine whether the user screen width is less than min width to show the sidebar
    const smallScreen: boolean = useMediaQuery('(max-width: 500px)');
    const showSidebarByDefault: boolean = useMediaQuery('(min-width: 1600px)');

    // hook to manage sidebar state (probably doesn't need to be extracted anymore)
    const sidebar = useSidebar(location.pathname, showSidebarByDefault);

    // hook to manage recent pool data in-session
    const recentPools: recentPoolsMethodsIF = useRecentPools(chainData.chainId);

    // value showing whether the screen size warrants hiding the sidebar
    const [hideOnMobile, setHideOnMobile] = useState<boolean>(true);

    // update sidebar hidden vs not hidden if screen width changes
    useEffect(() => setHideOnMobile(smallScreen), [smallScreen]);

    // fn to toggle visibility when the user is in mobile mode
    const toggleMobileModeVisibility = () => setHideOnMobile((prev) => !prev);

    // logic to open or close the sidebar automatically when the URL route changes
    useEffect(() => {
        if (
            sidebar.getStoredStatus() === 'open' ||
            showSidebarByDefault ||
            smallScreen
        ) {
            sidebar.open();
        } else {
            sidebar.close();
        }
    }, [
        location.pathname.includes('/trade'),
        location.pathname.includes('/explore'),
        showSidebarByDefault,
    ]);

    // logic to show a snackbar notification when a new receipt is received
    // I'm not really sure why we put this logic in this file? should move later
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

    // data to return from this context
    const sidebarState = {
        sidebar,
        recentPools,
        hideOnMobile,
        toggleMobileModeVisibility,
    };

    return (
        <SidebarContext.Provider value={sidebarState}>
            {props.children}
        </SidebarContext.Provider>
    );
};

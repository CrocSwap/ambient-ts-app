import { useMemo, useState } from 'react';
import { getLocalStorageItem } from '../../ambient-utils/dataLayer';

export interface sidebarMethodsIF {
    status: SidebarStatus;
    isOpen: boolean;
    isHiddenOnRoute: boolean;
    open: (persist?: boolean) => void;
    close: (persist?: boolean) => void;
    toggle: (persist?: boolean) => void;
    getStoredStatus: () => SidebarStatus | null;
    resetStoredStatus: () => void;
}

export type SidebarStatus = 'open' | 'closed';

export const useSidebar = (
    pathname: string,
    showByDefault: boolean,
): sidebarMethodsIF => {
    // base default status for the sidebar through the app
    const SIDEBAR_GLOBAL_DEFAULT: SidebarStatus = 'closed';

    // local storage key for persisted data
    const localStorageKey = 'sidebarStatus';
    const getStoredSidebarStatus = () =>
        getLocalStorageItem<SidebarStatus>(localStorageKey);

    // fn to reset the persisted value in local storage to the global default
    const resetPersist = () =>
        localStorage.setItem(localStorageKey, SIDEBAR_GLOBAL_DEFAULT);

    // hook to track sidebar status in local state
    // this hook initializes from local storage for returning users
    // will check a media query for viewport width if no persisted value is found
    // last fallback is a centrally-defined const
    const [sidebar, setSidebar] = useState<SidebarStatus>(
        (
            getStoredSidebarStatus() !== null
                ? getStoredSidebarStatus() === 'open'
                : showByDefault
        )
            ? 'open'
            : 'closed',
    );

    // reusable logic to update state and optionally persist data in local storage
    const changeSidebar = (
        newStatus: SidebarStatus,
        persist: boolean,
    ): void => {
        setSidebar(newStatus);
        persist && localStorage.setItem(localStorageKey, newStatus);
    };

    // fn to open the sidebar
    const openSidebar = (persist = false): void =>
        changeSidebar('open', persist);

    // fn to close the sidebar
    const closeSidebar = (persist = false): void =>
        changeSidebar('closed', persist);

    // fn to toggle the sidebar
    const toggleSidebar = (persist = false): void => {
        // logic router as desired action is conditional on current value
        // default action is to open the sidebar
        switch (sidebar) {
            case 'open':
                closeSidebar(persist);
                break;
            case 'closed':
            default:
                openSidebar(persist);
        }
    };

    // value whether to sidebar should be hidden on the current URL path
    const hidden = useMemo<boolean>(() => {
        // array of url paths on which to hide the sidebar
        const hiddenPaths = ['/swap', '/chat', '/404', '/account'];
        // determine if the current URL path starts with any proscribed strings
        const isPathHidden =
            pathname === '/' ||
            hiddenPaths.some((path: string) => pathname.startsWith(path));
        // return boolean value showing if sidebar is hidden on current route
        return isPathHidden;
    }, [pathname]);

    return useMemo(
        () => ({
            status: sidebar,
            isOpen: sidebar === 'open',
            isHiddenOnRoute: hidden,
            open: openSidebar,
            close: closeSidebar,
            toggle: toggleSidebar,
            getStoredStatus: getStoredSidebarStatus,
            resetStoredStatus: resetPersist,
        }),
        [sidebar, hidden, pathname],
    );
};

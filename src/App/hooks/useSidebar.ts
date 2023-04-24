import { useMemo, useState } from 'react';

export interface sidebarMethodsIF {
    status: string;
    isOpen: boolean;
    isHiddenOnRoute: boolean;
    open: (persist?: string) => void;
    close: (persist?: string) => void;
    toggle: (persist?: string) => void;
}

export const useSidebar = (pathname: string): sidebarMethodsIF => {
    // local storage key for persisted data
    const localStorageKey = 'sidebarStatus';

    // hook to track sidebar status in local state
    // this hook initializes from local storage for returning users
    // will default to 'open' if no value found (happens on first visit)
    const [sidebar, setSidebar] = useState<string>(
        localStorage.getItem(localStorageKey) || 'open',
    );

    // reusable logic to update state and optionally persist data in local storage
    const changeSidebar = (newStatus: string, persist: string): void => {
        if (newStatus === 'open') {
            console.log('opening the sidebar!');
        } else if (newStatus === 'closed') {
            console.log('closing the sidebar!');
        }
        if (persist) {
            console.log(`sending value ${newStatus} to local storage!`);
        } else {
            console.log('not updating local storage!');
        }
        setSidebar(newStatus);
        persist && localStorage.setItem(localStorageKey, newStatus);
    };

    // fn to open the sidebar
    const openSidebar = (persist = ''): void => changeSidebar('open', persist);

    // fn to close the sidebar
    const closeSidebar = (persist = ''): void => {
        changeSidebar('closed', persist);
    };

    // fn to toggle the sidebar
    const toggleSidebar = (persist = ''): void => {
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

    return {
        status: sidebar,
        isOpen: sidebar === 'open',
        isHiddenOnRoute: hidden,
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
    };
};

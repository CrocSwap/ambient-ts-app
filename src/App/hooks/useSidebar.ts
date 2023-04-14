import { useEffect, useMemo, useState } from 'react';

export const useSidebar = (
    pathname: string,
): [
    sidebar: string,
    openSidebar: () => void,
    closeSidebar: () => void,
    toggleSidebar: () => void,
] => {
    // hook to track sidebar status in local state
    // this hook initializes from local storage for returning users
    // will default to 'open' if no value found (happens on first visit)
    const [sidebar, setSidebar] = useState<string>(
        localStorage.getItem('sidebarOpen') || 'open',
    );

    // hook to update local storage when the user toggles the sidebar
    useEffect(() => {
        localStorage.setItem('sidebarOpen', sidebar);
    }, [sidebar]);

    // fn to open the sidebar
    const openSidebar = (): void => setSidebar('open');
    // fn to close the sidebar
    const closeSidebar = (): void => setSidebar('closed');
    // fn to toggle the sidebar
    const toggleSidebar = (): void => {
        // logic router as desired action is conditional on current value
        // default action is to open the sidebar
        switch (sidebar) {
            case 'open':
                closeSidebar();
                break;
            case 'closed':
            default:
                openSidebar();
        }
    };

    // value whether to sidebar should be hidden on the current URL path
    const hidden = useMemo<boolean>(() => {
        // array of url paths on which to hide the sidebar
        const hiddenPaths = ['/', '/swap'];
        // determine if the current URL path starts with any proscribed strings
        const isPathHidden = hiddenPaths.some((path: string) =>
            pathname.startsWith(path),
        );
        // return boolean value showing if sidebar is hidden on current route
        return isPathHidden;
    }, [pathname]);
    // this is just here to make the linter happy
    // please remove it once we're returning the value from the hook
    false && hidden;

    // return sidebar status and functions to update value
    return [sidebar, openSidebar, closeSidebar, toggleSidebar];
};

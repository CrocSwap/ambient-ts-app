import { useEffect, useState } from 'react';

export const useSidebar = (): [
    sidebar: string,
    openSidebar: () => void,
    closeSidebar: () => void,
    toggleSidebar: () => void
] => {
    console.log('called custom hook useSidebar()');
    const [sidebar, setSidebar] = useState(
        JSON.parse(localStorage.getItem('user') as string).sidebar ?? 'open'
    );

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') as string);
        user.sidebar = sidebar;
        localStorage.setItem('user', JSON.stringify(user));
    }, [sidebar]);

    const openSidebar = () => setSidebar('open');
    const closeSidebar = () => setSidebar('closed');
    const toggleSidebar = () => {
        switch (sidebar) {
            case 'open':
                closeSidebar();
                break;
            case 'closed':
            default:
                openSidebar();
        }
    }

    return [
        sidebar,
        openSidebar,
        closeSidebar,
        toggleSidebar
    ];
}
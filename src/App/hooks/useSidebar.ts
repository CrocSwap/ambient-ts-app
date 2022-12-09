import { useEffect, useState } from 'react';

export const useSidebar = (): [
    sidebar: string,
    openSidebar: () => void,
    closeSidebar: () => void,
    toggleSidebar: () => void
] => {
    const [sidebar, setSidebar] = useState(
        JSON.parse(localStorage.getItem('user') as string)?.sidebar ?? 'open'
    );

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') as string);
        user.sidebar = sidebar;
        localStorage.setItem('user', JSON.stringify(user));
    }, [sidebar]);

    const openSidebar = () => setSidebar('open');
    const closeSidebar = () => setSidebar('closed');
    const toggleSidebar = () => {
        console.log('im gonna toggle it!');
        switch (sidebar) {
            case 'open':
                console.log('we need to close it!');
                closeSidebar();
                break;
            case 'closed':
                console.log('open the sidebar!');
                openSidebar();
                break;
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
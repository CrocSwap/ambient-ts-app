import { useState } from 'react';

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
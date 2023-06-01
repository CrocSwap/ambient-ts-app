import { useState, KeyboardEvent, MouseEvent } from 'react';

export type LayoutHandler = {
    isTradeDrawerOpen: boolean;
    isSidebarDrawerOpen: boolean;
    toggleDefaultLayout: () => void;
    toggleSidebarDrawer: (
        open: boolean,
    ) => (event: KeyboardEvent | MouseEvent) => void;
    toggleTradeDrawer: (
        open: boolean,
    ) => (event: KeyboardEvent | MouseEvent) => void;
    setIsSidebarDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTradeDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const useLayoutHandler = (): LayoutHandler => {
    const [isTradeDrawerOpen, setIsTradeDrawerOpen] = useState(false);
    const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);

    const toggleDefaultLayout = (): void => {
        setIsSidebarDrawerOpen(false);
        setIsTradeDrawerOpen(false);
    };

    const toggleSidebarDrawer =
        (open: boolean) =>
        (event: KeyboardEvent | MouseEvent): void => {
            if (
                event.type === 'keydown' &&
                ((event as KeyboardEvent).key === 'Tab' ||
                    (event as KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            if (
                event.type === 'keydown' &&
                (event as KeyboardEvent).key === 'Escape'
            ) {
                setIsSidebarDrawerOpen(false);
                return;
            }

            setIsSidebarDrawerOpen(open);
        };

    const toggleTradeDrawer =
        (open: boolean) =>
        (event: KeyboardEvent | MouseEvent): void => {
            if (
                event.type === 'keydown' &&
                ((event as KeyboardEvent).key === 'Tab' ||
                    (event as KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            if (
                event.type === 'keydown' &&
                (event as KeyboardEvent).key === 'Escape'
            ) {
                setIsTradeDrawerOpen(false);
                return;
            }

            setIsTradeDrawerOpen(true);
        };

    return {
        isTradeDrawerOpen,
        isSidebarDrawerOpen,
        toggleDefaultLayout,
        toggleSidebarDrawer,
        toggleTradeDrawer,
        setIsSidebarDrawerOpen,
        setIsTradeDrawerOpen,
    };
};

export default useLayoutHandler;

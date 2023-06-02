import React, { createContext, useState } from 'react';

export type LayoutHandler = {
    isTradeDrawerOpen: boolean;
    isSidebarDrawerOpen: boolean;
    toggleDefaultLayout: () => void;
    toggleSidebarDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    toggleTradeDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    setIsSidebarDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTradeDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const LayoutHandlerContext = createContext<LayoutHandler>(
    {} as LayoutHandler,
);

export const LayoutHandlerContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [isTradeDrawerOpen, setIsTradeDrawerOpen] = useState(false);
    const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);

    console.log({ isSidebarDrawerOpen });

    const toggleDefaultLayout = (): void => {
        setIsSidebarDrawerOpen(false);
        setIsTradeDrawerOpen(false);
    };

    const toggleSidebarDrawer =
        (
            // eslint-disable-next-line
            open: boolean,
        ) =>
        (event: React.KeyboardEvent | React.MouseEvent): void => {
            if (
                event.type === 'keydown' &&
                ((event as React.KeyboardEvent).key === 'Tab' ||
                    (event as React.KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            if (
                event.type === 'keydown' &&
                (event as React.KeyboardEvent).key === 'Escape'
            ) {
                setIsSidebarDrawerOpen(false);
                return;
            }

            setIsSidebarDrawerOpen(true);

            console.log('opening sidebar drawer');
        };

    const toggleTradeDrawer =
        (
            // eslint-disable-next-line
            open: boolean,
        ) =>
        (event: React.KeyboardEvent | React.MouseEvent): void => {
            if (
                event.type === 'keydown' &&
                ((event as React.KeyboardEvent).key === 'Tab' ||
                    (event as React.KeyboardEvent).key === 'Shift')
            ) {
                return;
            }

            if (
                event.type === 'keydown' &&
                (event as React.KeyboardEvent).key === 'Escape'
            ) {
                setIsTradeDrawerOpen(false);
                return;
            }

            setIsTradeDrawerOpen(true);
        };

    const layoutHandler: LayoutHandler = {
        isTradeDrawerOpen,
        isSidebarDrawerOpen,
        toggleDefaultLayout,
        toggleSidebarDrawer,
        toggleTradeDrawer,
        setIsSidebarDrawerOpen,
        setIsTradeDrawerOpen,
    };

    return (
        <LayoutHandlerContext.Provider value={layoutHandler}>
            {props.children}
        </LayoutHandlerContext.Provider>
    );
};

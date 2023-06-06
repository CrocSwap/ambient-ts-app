import React, { createContext, useState } from 'react';

export type LayoutHandler = {
    isSidebarDrawerOpen: boolean;
    isTableDrawerOpen: boolean;
    toggleDefaultLayout: () => void;
    toggleSidebarDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;

    toggleTableDrawer: (
        open: boolean,
    ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
    setIsSidebarDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTableDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const LayoutHandlerContext = createContext<LayoutHandler>(
    {} as LayoutHandler,
);

export const LayoutHandlerContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
    const [isTableDrawerOpen, setIsTableDrawerOpen] = useState(false);

    const toggleDefaultLayout = (): void => {
        setIsSidebarDrawerOpen(false);

        setIsTableDrawerOpen(false);
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
        };

    const toggleTableDrawer =
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
                setIsTableDrawerOpen(false);
                return;
            }

            setIsTableDrawerOpen(true);
        };

    const layoutHandler: LayoutHandler = {
        isSidebarDrawerOpen,
        toggleDefaultLayout,
        toggleSidebarDrawer,

        setIsSidebarDrawerOpen,

        isTableDrawerOpen,
        setIsTableDrawerOpen,
        toggleTableDrawer,
    };

    return (
        <LayoutHandlerContext.Provider value={layoutHandler}>
            {props.children}
        </LayoutHandlerContext.Provider>
    );
};

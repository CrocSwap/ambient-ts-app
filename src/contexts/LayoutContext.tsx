import React, { createContext, useContext } from 'react';
import useLayoutHandler, {
    LayoutHandler,
} from '../utils/hooks/useLayoutHandler';

// Define the context
interface LayoutHandlerContextIF {
    layoutHandler: LayoutHandler;
}

export const LayoutHandlerContext = createContext<LayoutHandlerContextIF>(
    {} as LayoutHandlerContextIF,
);

// Define the provider component
export const LayoutHandlerContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const layoutHandler = useLayoutHandler();

    return (
        <LayoutHandlerContext.Provider value={{ layoutHandler }}>
            {props.children}
        </LayoutHandlerContext.Provider>
    );
};

// Custom hook to access the layoutHandler from the context
export const useLayoutHandlerContext = (): LayoutHandler =>
    useContext(LayoutHandlerContext).layoutHandler;

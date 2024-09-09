import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
} from 'react';

interface FutaHomeContextProps {
    isActionButtonVisible: boolean;
    setIsActionButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
    showTerminal: boolean;
    setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
    hasVideoPlayedOnce: boolean;
    setHasVideoPlayedOnce: React.Dispatch<React.SetStateAction<boolean>>;
    showHomeVideoLocalStorage: boolean;
    setShowHomeVideoLocalStorage: React.Dispatch<React.SetStateAction<boolean>>;
}

const FutaHomeContext = createContext<FutaHomeContextProps | undefined>(
    undefined,
);

export const FutaHomeContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [isActionButtonVisible, setIsActionButtonVisible] = useState(false);
    const [showTerminal, setShowTerminal] = useState(true);
    const [hasVideoPlayedOnce, setHasVideoPlayedOnce] = useState(false);
    const [showHomeVideoLocalStorage, setShowHomeVideoLocalStorage] = useState(
        () => {
            const saved = localStorage.getItem('showHomeVideoLocalStorage');
            return saved === null ? true : saved === 'true';
        },
    );

    useEffect(() => {
        localStorage.setItem(
            'showHomeVideoLocalStorage',
            showHomeVideoLocalStorage.toString(),
        );
    }, [showHomeVideoLocalStorage]);

    return (
        <FutaHomeContext.Provider
            value={{
                isActionButtonVisible,
                setIsActionButtonVisible,
                showTerminal,
                setShowTerminal,
                hasVideoPlayedOnce,
                setHasVideoPlayedOnce,
                showHomeVideoLocalStorage,
                setShowHomeVideoLocalStorage,
            }}
        >
            {children}
        </FutaHomeContext.Provider>
    );
};

export const useFutaHomeContext = () => {
    const context = useContext(FutaHomeContext);
    if (context === undefined) {
        throw new Error(
            'useFutaHomeContext must be used within a FutaHomeProvider',
        );
    }
    return context;
};

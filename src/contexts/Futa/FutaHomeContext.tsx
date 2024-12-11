import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { SHOW_TUTOS_DEFAULT } from '../../ambient-utils/constants';

interface FutaHomeContextProps {
    isActionButtonVisible: boolean;
    setIsActionButtonVisible: React.Dispatch<React.SetStateAction<boolean>>;
    showTerminal: boolean;
    setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
    hasVideoPlayedOnce: boolean;
    setHasVideoPlayedOnce: React.Dispatch<React.SetStateAction<boolean>>;
    showHomeVideoLocalStorage: boolean;
    setShowHomeVideoLocalStorage: React.Dispatch<React.SetStateAction<boolean>>;
    showTutosLocalStorage: boolean;
    bindShowTutosLocalStorage: (value: boolean) => void;
}

const FutaHomeContext = createContext<FutaHomeContextProps | undefined>(
    undefined,
);

export const FutaHomeContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    if (import.meta.hot) {
        import.meta.hot.accept(() => {
            window.location.reload(); // Forces a full browser reload when context code changes
        });
    }
    const [isActionButtonVisible, setIsActionButtonVisible] = useState(false);
    const [showTerminal, setShowTerminal] = useState(true);
    const [hasVideoPlayedOnce, setHasVideoPlayedOnce] = useState(false);
    const [showHomeVideoLocalStorage, setShowHomeVideoLocalStorage] = useState(
        () => {
            const saved = localStorage.getItem('showHomeVideoLocalStorage');
            return saved === null ? true : saved === 'true';
        },
    );
    const [showTutosLocalStorage, setShowTutosLocalStorage] = useState(() => {
        const lsValue = localStorage.getItem('showTutosLocalStorage');
        return lsValue === null
            ? SHOW_TUTOS_DEFAULT === 'true'
            : lsValue === 'true';
    });

    useEffect(() => {
        localStorage.setItem(
            'showHomeVideoLocalStorage',
            showHomeVideoLocalStorage.toString(),
        );
    }, [showHomeVideoLocalStorage]);

    const bindShowTutosLocalStorage = (value: boolean) => {
        localStorage.setItem('showTutosLocalStorage', value.toString());
        setShowTutosLocalStorage(value);
    };

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
                showTutosLocalStorage,
                bindShowTutosLocalStorage,
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

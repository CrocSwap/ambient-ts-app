import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
    globalPopupMethodsIF,
    useGlobalPopup,
} from '../App/components/GlobalPopup/useGlobalPopup';
import { skinMethodsIF, useSkin } from '../App/hooks/useSkin';
import useChatApi from '../components/Chat/Service/ChatApi';
import { useModal } from '../components/Global/Modal/useModal';
import {
    snackbarMethodsIF,
    useSnackbar,
} from '../components/Global/SnackbarComponent/useSnackbar';
import { CHAT_ENABLED } from '../constants';

interface AppStateContextIF {
    appOverlay: { isActive: boolean; setIsActive: (val: boolean) => void };
    globalPopup: globalPopupMethodsIF;
    snackbar: snackbarMethodsIF;
    tutorial: { isActive: boolean; setIsActive: (val: boolean) => void };
    skin: skinMethodsIF;
    theme: {
        selected: 'dark' | 'light';
        setSelected: (val: 'dark' | 'light') => void;
    };
    chat: {
        isOpen: boolean;
        setIsOpen: (val: boolean) => void;
        isEnabled: boolean;
        setIsEnabled: (val: boolean) => void;
    };
    server: { isEnabled: boolean; isUserOnline: boolean };
    subscriptions: { isEnabled: boolean };
    wagmiModal: {
        isOpen: boolean;
        open: () => void;
        close: () => void;
    };
}

export const AppStateContext = createContext<AppStateContextIF>(
    {} as AppStateContextIF,
);

export const AppStateContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [isAppOverlayActive, setIsAppOverlayActive] = useState(false);
    const [isTutorialMode, setIsTutorialMode] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatEnabled, setIsChatEnabled] = useState(CHAT_ENABLED);
    const [isUserOnline, setIsUserOnline] = useState(navigator.onLine);

    window.ononline = () => setIsUserOnline(true);
    window.onoffline = () => setIsUserOnline(false);

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED.toLowerCase() ===
              'true'
            : true;

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off subscriptions to the cache and chat servers
    const areSubscriptionsEnabled =
        process.env.REACT_APP_SUBSCRIPTIONS_ARE_ENABLED !== undefined
            ? process.env.REACT_APP_SUBSCRIPTIONS_ARE_ENABLED.toLowerCase() ===
              'true'
            : true;

    // All of these objects results from use*() functions are assumed to be memoized correct,
    // I.e. updated if and only if their conrents need to be updated.
    const snackbar = useSnackbar();
    const globalPopup = useGlobalPopup();
    const skin = useSkin('purple_dark');

    const [
        isWagmiModalOpenWallet,
        openWagmiModalWallet,
        closeWagmiModalWallet,
    ] = useModal();

    const appStateContext = useMemo(
        () => ({
            appOverlay: {
                isActive: isAppOverlayActive,
                setIsActive: setIsAppOverlayActive,
            },
            globalPopup,
            snackbar,
            tutorial: {
                isActive: isTutorialMode,
                setIsActive: setIsTutorialMode,
            },
            skin,
            theme: { selected: theme, setSelected: setTheme },
            chat: {
                isOpen: isChatOpen,
                setIsOpen: setIsChatOpen,
                isEnabled: isChatEnabled,
                setIsEnabled: setIsChatEnabled,
            },
            server: { isEnabled: isServerEnabled, isUserOnline: isUserOnline },
            subscriptions: { isEnabled: areSubscriptionsEnabled },
            wagmiModal: {
                isOpen: isWagmiModalOpenWallet,
                open: openWagmiModalWallet,
                close: closeWagmiModalWallet,
            },
        }),
        [
            // Dependency list includes the memoized use*() values from above and any primitives
            // directly references in above appState object
            snackbar,
            globalPopup,
            skin,
            isChatOpen,
            isChatEnabled,
            isServerEnabled,
            isUserOnline,
            areSubscriptionsEnabled,
            isAppOverlayActive,
            isTutorialMode,
            theme,
            isWagmiModalOpenWallet,
            openWagmiModalWallet,
            closeWagmiModalWallet,
        ],
    );

    // Heartbeat that checks if the chat server is reachable and has a stable db connection every 60 seconds.
    const { getStatus } = useChatApi();
    useEffect(() => {
        if (CHAT_ENABLED) {
            const interval = setInterval(() => {
                getStatus().then((isChatUp) => {
                    setIsChatEnabled(isChatUp);
                });
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [isChatEnabled, CHAT_ENABLED]);

    return (
        <AppStateContext.Provider value={appStateContext}>
            {props.children}
        </AppStateContext.Provider>
    );
};

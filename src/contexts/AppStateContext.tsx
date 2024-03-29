import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';
import {
    globalPopupMethodsIF,
    useGlobalPopup,
} from '../App/components/GlobalPopup/useGlobalPopup';
import useChatApi from '../components/Chat/Service/ChatApi';
import { useModal } from '../components/Global/Modal/useModal';
import {
    snackbarMethodsIF,
    useSnackbar,
} from '../components/Global/SnackbarComponent/useSnackbar';
import {
    CHAT_ENABLED,
    CACHE_UPDATE_FREQ_IN_MS,
    DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES,
    DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES,
} from '../ambient-utils/constants';
import {
    getCtaDismissalsFromLocalStorage,
    saveCtaDismissalToLocalStorage,
} from '../App/functions/localStorage';
import {
    ambientBrandAssets,
    brandAssetsIF,
} from '../assets/ambient/ambientBrandAssets';

interface AppStateContextIF {
    appOverlay: { isActive: boolean; setIsActive: (val: boolean) => void };
    appHeaderDropdown: {
        isActive: boolean;
        setIsActive: (val: boolean) => void;
    };
    globalPopup: globalPopupMethodsIF;
    snackbar: snackbarMethodsIF;
    tutorial: { isActive: boolean; setIsActive: (val: boolean) => void };
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
    showPointSystemPopup: boolean;
    dismissPointSystemPopup: () => void;
    showTopPtsBanner: boolean;
    dismissTopBannerPopup: () => void;
    isUserIdle: boolean;
    brandAssetSet: brandAssetsIF;
}

export const AppStateContext = createContext<AppStateContextIF>(
    {} as AppStateContextIF,
);

export const AppStateContextProvider = (props: {
    children: React.ReactNode;
}) => {
    const [isAppOverlayActive, setIsAppOverlayActive] = useState(false);
    const [isAppHeaderDropdown, setIsAppHeaderDropdown] = useState(false);
    const [isTutorialMode, setIsTutorialMode] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatEnabled, setIsChatEnabled] = useState(CHAT_ENABLED);
    const [isUserOnline, setIsUserOnline] = useState(navigator.onLine);
    const [isUserIdle, setIsUserIdle] = useState(false);

    // load obj holding brand default settings and data for white-label product
    let brandAssetSet: brandAssetsIF;
    switch (process.env.REACT_APP_BRAND_ASSET_SET ?? 'ambient') {
        case 'ambient':
        default:
            brandAssetSet = ambientBrandAssets;
            break;
    }

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

    const [
        isWagmiModalOpenWallet,
        openWagmiModalWallet,
        closeWagmiModalWallet,
    ] = useModal();

    const pointsModalDismissalDuration =
        DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES || 1440;

    const pointsBannerDismissalDuration =
        DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES || 1440;

    const ctaPopupDismissalTime =
        getCtaDismissalsFromLocalStorage().find(
            (x) => x.ctaId === 'points_modal_cta',
        )?.unixTimeOfDismissal || 0;

    const [showPointSystemPopup, setShowPointSystemPopup] = useState(
        !ctaPopupDismissalTime ||
            ctaPopupDismissalTime <
                Math.floor(
                    Date.now() / 1000 - 60 * pointsModalDismissalDuration,
                ),
    );

    const dismissPointSystemPopup = () => {
        setShowPointSystemPopup(false);
        saveCtaDismissalToLocalStorage({ ctaId: 'points_modal_cta' });
    };

    const ctaBannerDismissalTime =
        getCtaDismissalsFromLocalStorage().find(
            (x) => x.ctaId === 'top_points_banner_cta',
        )?.unixTimeOfDismissal || 0;

    const [showTopPtsBanner, setShowTopPtsBanner] = useState<boolean>(
        !ctaBannerDismissalTime ||
            ctaBannerDismissalTime <
                Math.floor(
                    Date.now() / 1000 - 60 * pointsBannerDismissalDuration,
                ),
    );

    const dismissTopBannerPopup = () => {
        setShowTopPtsBanner(false);
        saveCtaDismissalToLocalStorage({ ctaId: 'top_points_banner_cta' });
    };

    const appStateContext = useMemo(
        () => ({
            appOverlay: {
                isActive: isAppOverlayActive,
                setIsActive: setIsAppOverlayActive,
            },
            appHeaderDropdown: {
                isActive: isAppHeaderDropdown,
                setIsActive: setIsAppHeaderDropdown,
            },
            globalPopup,
            snackbar,
            tutorial: {
                isActive: isTutorialMode,
                setIsActive: setIsTutorialMode,
            },
            chat: {
                isOpen: isChatOpen,
                setIsOpen: setIsChatOpen,
                isEnabled: isChatEnabled,
                setIsEnabled: setIsChatEnabled,
            },
            server: { isEnabled: isServerEnabled, isUserOnline: isUserOnline },
            isUserIdle,
            subscriptions: { isEnabled: areSubscriptionsEnabled },
            wagmiModal: {
                isOpen: isWagmiModalOpenWallet,
                open: openWagmiModalWallet,
                close: closeWagmiModalWallet,
            },
            showPointSystemPopup,
            dismissPointSystemPopup,
            showTopPtsBanner,
            dismissTopBannerPopup,
            brandAssetSet,
        }),
        [
            // Dependency list includes the memoized use*() values from above and any primitives
            // directly references in above appState object
            snackbar,
            globalPopup,
            isChatOpen,
            isChatEnabled,
            isServerEnabled,
            isUserOnline,
            isUserIdle,
            areSubscriptionsEnabled,
            isAppOverlayActive,
            isTutorialMode,
            isWagmiModalOpenWallet,
            openWagmiModalWallet,
            closeWagmiModalWallet,
            isAppHeaderDropdown,
            setIsAppHeaderDropdown,
            showPointSystemPopup,
            dismissPointSystemPopup,
            showTopPtsBanner,
            dismissTopBannerPopup,
        ],
    );

    const onIdle = () => {
        setIsUserIdle(true);
    };

    const onActive = () => {
        setIsUserIdle(false);
    };

    useIdleTimer({
        onIdle,
        onActive,
        timeout: 1000 * 60 * 1, // set user to idle after 1 minute
        promptTimeout: 0,
        events: [
            'mousemove',
            'keydown',
            'wheel',
            'DOMMouseScroll',
            'mousewheel',
            'mousedown',
            'touchstart',
            'touchmove',
            'MSPointerDown',
            'MSPointerMove',
            'visibilitychange',
        ],
        immediateEvents: [],
        debounce: 0,
        throttle: 0,
        eventsThrottle: 200,
        element: document,
        startOnMount: true,
        startManually: false,
        stopOnIdle: false,
        crossTab: false,
        name: 'idle-timer',
        syncTimers: 0,
        leaderElection: false,
    });

    // Heartbeat that checks if the chat server is reachable and has a stable db connection every 60 seconds.
    const { getStatus } = useChatApi();
    useEffect(() => {
        if (CHAT_ENABLED) {
            const interval = setInterval(() => {
                getStatus().then((isChatUp) => {
                    setIsChatEnabled(isChatUp);
                });
            }, CACHE_UPDATE_FREQ_IN_MS);
            return () => clearInterval(interval);
        }
    }, [isChatEnabled, CHAT_ENABLED]);

    return (
        <AppStateContext.Provider value={appStateContext}>
            {props.children}
        </AppStateContext.Provider>
    );
};

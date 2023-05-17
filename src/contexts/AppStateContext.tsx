import { createContext } from 'react';
import { globalModalMethodsIF } from '../App/components/GlobalModal/useGlobalModal';
import { globalPopupMethodsIF } from '../App/components/GlobalPopup/useGlobalPopup';
import { sidebarMethodsIF } from '../App/hooks/useSidebar';
import { skinMethodsIF } from '../App/hooks/useSkin';
import { snackbarMethodsIF } from '../components/Global/SnackbarComponent/useSnackbar';

interface AppStateIF {
    appOverlay: { isActive: boolean; setIsActive: (val: boolean) => void };
    globalModal: globalModalMethodsIF;
    globalPopup: globalPopupMethodsIF;
    sidebar: sidebarMethodsIF;
    snackbar: snackbarMethodsIF;
    tutorial: { isActive: boolean; setIsActive: (val: boolean) => void };
    skin: skinMethodsIF;
    theme: {
        selected: 'dark' | 'light';
        setSelected: (val: 'dark' | 'light') => void;
    };
    outsideTab: { selected: number; setSelected: (val: number) => void };
    outsideControl: { isActive: boolean; setIsActive: (val: boolean) => void };
    chat: {
        isOpen: boolean;
        setIsOpen: (val: boolean) => void;
        isEnabled: boolean;
        setIsEnabled: (val: boolean) => void;
    };
    chart: {
        isFullScreen: boolean;
        setIsFullScreen: (val: boolean) => void;
        isEnabled: boolean;
    };
    server: { isEnabled: boolean };
    subscriptions: { isEnabled: boolean };
}

export const AppStateContext = createContext<AppStateIF>({} as AppStateIF);

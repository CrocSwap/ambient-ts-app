/** ***** Import React and Dongles *******/
import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SnackbarComponent from '../components/Global/SnackbarComponent/SnackbarComponent';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
// import SidebarFooter from '../components/Global/Sidebar/SidebarFooter/SidebarFooter';

/** * **** Import Local Files *******/
import './App.css';
import ChatPanel from '../components/Chat/ChatPanel';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import GateWalletModal from './components/WalletModal/GateWalletModal';
import GlobalPopup from './components/GlobalPopup/GlobalPopup';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useKeyPress from './hooks/useKeyPress';
import { AppStateContext } from '../contexts/AppStateContext';
import { SidebarContext } from '../contexts/SidebarContext';
import { BrandContext } from '../contexts/BrandContext';

import useMediaQuery from '../utils/hooks/useMediaQuery';
import { FlexContainer } from '../styled/Common';
import PointSystemPopup from '../components/Global/PointSystemPopup/PointSystemPopup';
import FooterNav from '../components/Global/FooterNav/FooterNav';

import { RouteRenderer } from '../routes';
import Navbar from '../components/Futa/Navbar/Navbar';
import Footer from '../components/Futa/Footer/Footer';
import { useModal } from '../components/Global/Modal/useModal';
import CSSModal from '../pages/common/CSSDebug/CSSModal';
import { useBottomSheet } from '../contexts/BottomSheetContext';
import { ChartContext } from '../contexts';

/** ***** React Function *******/
export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentLocation = location.pathname;
    const { isFullScreen } = useContext(ChartContext);

    const {
        chat: {
            isOpen: isChatOpen,
            setIsOpen: setChatOpen,
            isEnabled: isChatEnabled,
        },
        walletModal: { isOpen: isWalletModalOpen },
        appHeaderDropdown,
        showPointSystemPopup,
        dismissPointSystemPopup,
    } = useContext(AppStateContext);
    const { platformName, skin, showPoints } = useContext(BrandContext);
    const {
        sidebar: { toggle: toggleSidebar },
    } = useContext(SidebarContext);
    const { isBottomSheetOpen } = useBottomSheet();

    const containerStyle = currentLocation.includes('trade')
        ? 'content-container-trade'
        : 'content-container';

    // CONTEXT: investigate
    // KEYBOARD SHORTCUTS ROUTES
    const routeShortcuts = {
        S: '/swap',
        T: '/trade',
        M: 'trade/market',
        R: 'trade/pool',
        L: 'trade/limit',
        P: '/account',
        C: '/chat',
    };
    Object.entries(routeShortcuts).forEach(([key, route]) => {
        useKeyboardShortcuts({ modifierKeys: ['Shift'], key }, () => {
            navigate(route);
        });
    });
    // KEYBOARD SHORTCUTS STATES
    // keyboard shortcuts for states will require multiple modifier keys.
    useKeyboardShortcuts(
        { modifierKeys: ['Shift', 'Control'], key: ' ' },
        () => {
            toggleSidebar(true);
        },
    );
    useKeyboardShortcuts(
        { modifierKeys: ['Shift', 'Control'], key: 'C' },
        () => {
            setChatOpen(!isChatOpen);
        },
    );
    // Since input field are autofocused on each route, we need a way for the user to exit that focus on their keyboard. This achieves that.
    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            const focusedInput = document?.querySelector(
                ':focus',
            ) as HTMLInputElement;
            if (focusedInput) {
                focusedInput.blur();
            }
        }
    }, [isEscapePressed]);

    useEffect(() => {
        appHeaderDropdown.setIsActive(false);
    }, [location]);

    const showMobileVersion = useMediaQuery('(max-width: 800px)');
    const ambientFooter = (
        <div data-theme={skin.active} className='footer_container'>
            {currentLocation !== '/' &&
                currentLocation !== '/404' &&
                currentLocation !== '/terms' &&
                currentLocation !== '/privacy' &&
                currentLocation !== '/faq' &&
                !currentLocation.includes('/chat') &&
                isChatEnabled &&
                !isFullScreen && <ChatPanel isFullScreen={false} />}
        </div>
    );

    // logic to handle opening and closing of the CSS modal
    const [isCSSModalOpen, openCSSModal, closeCSSModal] = useModal();
    // bind keyboard event to toggle CSS modal open or closed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (
                (e.ctrlKey || e.metaKey) &&
                e.shiftKey &&
                e.key.toLowerCase() === 'k'
            ) {
                isCSSModalOpen ? closeCSSModal() : openCSSModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCSSModalOpen]);

    const footerDisplay =
        platformName === 'futa' ? (
            <Footer data-theme={skin.active} />
        ) : (
            showMobileVersion && <FooterNav />
        );

    return (
        <>
            {location.pathname == '/' && platformName !== 'futa' && (
                <PageHeader />
            )}
            <FlexContainer
                flexDirection='column'
                className={
                    platformName === 'futa' ? 'futa_main' : containerStyle
                }
                data-theme={skin.active}
                style={{
                    height:
                        location.pathname == '/'
                            ? 'calc(100vh - 56px)'
                            : '100dvh',
                }}
            >
                {showPoints && showPointSystemPopup && (
                    <PointSystemPopup
                        dismissPointSystemPopup={dismissPointSystemPopup}
                    />
                )}
                <AppOverlay />
                {platformName === 'futa' ? (
                    <Navbar />
                ) : (
                    location.pathname !== '/' && <PageHeader />
                )}
                <RouteRenderer platformName={platformName} />
            </FlexContainer>

            <GlobalPopup data-theme={skin.active} />
            <SnackbarComponent />

            {ambientFooter}
            {!isBottomSheetOpen && footerDisplay}

            {isWalletModalOpen && <GateWalletModal />}
            {isCSSModalOpen && <CSSModal close={() => closeCSSModal()} />}
        </>
    );
}

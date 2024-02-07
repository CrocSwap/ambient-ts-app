/** ***** Import React and Dongles *******/
import { useContext, useEffect } from 'react';
import {
    Routes,
    Route,
    useLocation,
    Navigate,
    useNavigate,
} from 'react-router-dom';
import SnackbarComponent from '../components/Global/SnackbarComponent/SnackbarComponent';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import Sidebar from './components/Sidebar/Sidebar';
import Home from '../pages/Home/Home';
import Portfolio from '../pages/Portfolio/Portfolio';
import TradeSwap from '../pages/Trade/Swap/Swap';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import TermsOfService from '../pages/TermsOfService/TermsOfService';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';
import InitPool from '../pages/InitPool/InitPool';
import Reposition from '../pages/Trade/Reposition/Reposition';
import SidebarFooter from '../components/Global/Sidebar/SidebarFooter/SidebarFooter';

/** * **** Import Local Files *******/
import './App.css';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import ChatPanel from '../components/Chat/ChatPanel';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import WalletModalWagmi from './components/WalletModal/WalletModalWagmi';
import GlobalPopup from './components/GlobalPopup/GlobalPopup';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useKeyPress from './hooks/useKeyPress';
import Accessibility from '../pages/Accessibility/Accessibility';
import { AppStateContext } from '../contexts/AppStateContext';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import { SidebarContext } from '../contexts/SidebarContext';
import { ChartContext } from '../contexts/ChartContext';
import PrivacyPolicy from '../pages/PrivacyPolicy/PrivacyPolicy';
import SwitchNetwork from '../components/Global/SwitchNetworkAlert/SwitchNetwork/SwitchNetwork';
import Explore from '../pages/Explore/Explore';
import useMediaQuery from '../utils/hooks/useMediaQuery';
import { FlexContainer } from '../styled/Common';
import ExampleForm from '../pages/InitPool/FormExample';

/** ***** React Function *******/
export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentLocation = location.pathname;

    const {
        chat: {
            isOpen: isChatOpen,
            setIsOpen: setChatOpen,
            isEnabled: isChatEnabled,
        },
        theme: { selected: selectedTheme },
        wagmiModal: { isOpen: isWagmiModalOpen },
    } = useContext(AppStateContext);
    const { isWalletChainSupported, defaultUrlParams } =
        useContext(CrocEnvContext);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const {
        sidebar: { isOpen: isSidebarOpen, toggle: toggleSidebar },
    } = useContext(SidebarContext);

    const smallScreen = useMediaQuery('(max-width: 500px)');

    // Take away margin from left if we are on homepage or swap
    const swapBodyStyle =
        currentLocation.startsWith('/swap') && !smallScreen
            ? 'swap-body'
            : null;

    // Show sidebar on all pages except for home, swap, chat, and 404
    const sidebarRender = smallScreen ? (
        <Sidebar />
    ) : (
        currentLocation !== '/' &&
        currentLocation !== '/swap' &&
        currentLocation !== '/404' &&
        currentLocation !== '/terms' &&
        currentLocation !== '/privacy' &&
        !currentLocation.includes('/chat') &&
        !currentLocation.includes('/initpool') &&
        !fullScreenChart && (
            // isChainSupported &&
            <Sidebar />
        )
    );

    const sidebarDislayStyle = isSidebarOpen
        ? 'sidebar_content_layout'
        : 'sidebar_content_layout_close';

    const showSidebarOrNullStyle = smallScreen
        ? sidebarDislayStyle
        : currentLocation == '/' ||
          currentLocation == '/swap' ||
          currentLocation == '/404' ||
          currentLocation == '/terms' ||
          currentLocation == '/privacy' ||
          currentLocation.includes('/chat') ||
          currentLocation.startsWith('/swap')
        ? 'hide_sidebar'
        : sidebarDislayStyle;

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
    const showMobileVersion = useMediaQuery('(max-width: 500px)');

    return (
        <>
            <FlexContainer
                flexDirection='column'
                className={containerStyle}
                data-theme={selectedTheme}
            >
                {!isWalletChainSupported && <SwitchNetwork />}
                <AppOverlay />
                <PageHeader />
                <section
                    className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}
                >
                    {(!currentLocation.startsWith('/swap') || smallScreen) &&
                        sidebarRender}
                    <Routes>
                        <Route index element={<Home />} />
                        <Route
                            path='accessibility'
                            element={<Accessibility />}
                        />
                        <Route path='trade' element={<Trade />}>
                            <Route
                                path=''
                                element={
                                    <Navigate to='/trade/market' replace />
                                }
                            />
                            <Route
                                path='market'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.market}
                                        replace
                                    />
                                }
                            />
                            <Route
                                path='market/:params'
                                element={<TradeSwap isOnTradeRoute={true} />}
                            />
                            <Route
                                path='limit'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.limit}
                                        replace
                                    />
                                }
                            />
                            <Route path='limit/:params' element={<Limit />} />
                            <Route
                                path='pool'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.pool}
                                        replace
                                    />
                                }
                            />
                            <Route path='pool/:params' element={<Range />} />
                            <Route
                                path='reposition'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.pool}
                                        replace
                                    />
                                }
                            />
                            <Route
                                path='reposition/:params'
                                element={<Reposition />}
                            />
                            <Route
                                path='edit/'
                                element={
                                    <Navigate to='/trade/market' replace />
                                }
                            />
                        </Route>
                        <Route
                            path='chat'
                            element={
                                <ChatPanel isFullScreen={true} appPage={true} />
                            }
                        />
                        <Route
                            path='chat/:params'
                            element={
                                <ChatPanel isFullScreen={true} appPage={true} />
                            }
                        />
                        <Route path='initpool/:params' element={<InitPool />} />
                        <Route path='account' element={<Portfolio />} />
                        <Route
                            path='account/:address'
                            element={<Portfolio />}
                        />
                        <Route
                            path='swap'
                            element={
                                <Navigate replace to={defaultUrlParams.swap} />
                            }
                        />
                        <Route path='explore' element={<Explore />} />
                        <Route path='swap/:params' element={<Swap />} />
                        <Route path='terms' element={<TermsOfService />} />
                        <Route path='privacy' element={<PrivacyPolicy />} />
                        {IS_LOCAL_ENV && (
                            <Route path='testpage' element={<TestPage />} />
                        )}
                        {IS_LOCAL_ENV && (
                            <Route
                                path='template/form'
                                element={<ExampleForm />}
                            />
                        )}
                        <Route path='/:address' element={<Portfolio />} />
                        <Route path='/404' element={<NotFound />} />
                        <Route
                            path='*'
                            element={<Navigate to='/404' replace />}
                        />
                    </Routes>
                </section>
            </FlexContainer>
            <div className='footer_container'>
                {currentLocation !== '/' &&
                    currentLocation !== '/404' &&
                    currentLocation !== '/terms' &&
                    currentLocation !== '/privacy' &&
                    !currentLocation.includes('/chat') &&
                    isChatEnabled && <ChatPanel isFullScreen={false} />}
                {showMobileVersion && currentLocation !== '/' && (
                    <SidebarFooter />
                )}
            </div>
            <GlobalPopup />
            <SnackbarComponent />
            {isWagmiModalOpen && <WalletModalWagmi />}
        </>
    );
}

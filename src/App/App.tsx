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
// import SidebarFooter from '../components/Global/Sidebar/SidebarFooter/SidebarFooter';

/** * **** Import Local Files *******/
import './App.css';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import ChatPanel from '../components/Chat/ChatPanel';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import GateWalletModal from './components/WalletModal/GateWalletModal';
import GlobalPopup from './components/GlobalPopup/GlobalPopup';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useKeyPress from './hooks/useKeyPress';
import Accessibility from '../pages/Accessibility/Accessibility';
import { AppStateContext } from '../contexts/AppStateContext';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import { SidebarContext } from '../contexts/SidebarContext';
import { BrandContext } from '../contexts/BrandContext';
import PrivacyPolicy from '../pages/PrivacyPolicy/PrivacyPolicy';
import FAQPoints from '../pages/FAQ/FAQPoints';
import Explore from '../pages/Explore/Explore';
import useMediaQuery from '../utils/hooks/useMediaQuery';
import { FlexContainer } from '../styled/Common';
import ExampleForm from '../pages/InitPool/FormExample';
import PointSystemPopup from '../components/Global/PointSystemPopup/PointSystemPopup';
import FooterNav from '../components/Global/FooterNav/FooterNav';

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
        walletModal: { isOpen: isWalletModalOpen },
        appHeaderDropdown,
        showPointSystemPopup,
        dismissPointSystemPopup,
    } = useContext(AppStateContext);
    const { defaultUrlParams } = useContext(CrocEnvContext);
    const { skin, showPoints } = useContext(BrandContext);
    const {
        sidebar: { toggle: toggleSidebar },
    } = useContext(SidebarContext);

    const smallScreen = useMediaQuery('(max-width: 500px)');

    // Take away margin from left if we are on homepage or swap
    const swapBodyStyle =
        currentLocation.startsWith('/swap') && !smallScreen
            ? 'swap-body'
            : null;

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
            {location.pathname == '/' && <PageHeader />}
            <FlexContainer
                flexDirection='column'
                className={`${containerStyle} `}
                data-theme={skin}
                style={{
                    height:
                        location.pathname == '/'
                            ? 'calc(100vh - 56px)'
                            : '100vh',
                }}
            >
                {showPoints && showPointSystemPopup && (
                    <PointSystemPopup
                        dismissPointSystemPopup={dismissPointSystemPopup}
                    />
                )}
                <AppOverlay />
                {location.pathname !== '/' && <PageHeader />}

                <div
                    className={appHeaderDropdown.isActive ? 'app_blur' : ''}
                    onClick={() => appHeaderDropdown.setIsActive(false)}
                />
                <section className={`${swapBodyStyle}`}>
                    {/* {(!currentLocation.startsWith('/swap') || smallScreen) &&
                        sidebarRender} */}
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
                            path='xp-leaderboard'
                            element={<Portfolio isLevelsPage isRanksPage />}
                        />
                        <Route
                            path='account/transactions'
                            element={<Portfolio specificTab='transactions' />}
                        />
                        <Route
                            path='account/limits'
                            element={<Portfolio specificTab='limits' />}
                        />
                        <Route
                            path='account/liquidity'
                            element={<Portfolio specificTab='liquidity' />}
                        />
                        <Route
                            path='account/points'
                            element={<Portfolio specificTab='points' />}
                        />
                        <Route
                            path='account/exchange-balances'
                            element={
                                <Portfolio specificTab='exchange-balances' />
                            }
                        />
                        <Route
                            path='account/wallet-balances'
                            element={
                                <Portfolio specificTab='wallet-balances' />
                            }
                        />
                        <Route
                            path='account/xp'
                            element={<Portfolio isLevelsPage />}
                        />
                        <Route
                            path='account/xp/history'
                            element={
                                <Portfolio isLevelsPage isViewMoreActive />
                            }
                        />
                        <Route
                            path='account/:address'
                            element={<Portfolio />}
                        />
                        <Route
                            path='account/:address/transactions'
                            element={<Portfolio specificTab='transactions' />}
                        />
                        <Route
                            path='account/:address/limits'
                            element={<Portfolio specificTab='limits' />}
                        />
                        <Route
                            path='account/:address/liquidity'
                            element={<Portfolio specificTab='liquidity' />}
                        />
                        <Route
                            path='account/:address/points'
                            element={<Portfolio specificTab='points' />}
                        />
                        <Route
                            path='account/:address/exchange-balances'
                            element={
                                <Portfolio specificTab='exchange-balances' />
                            }
                        />
                        <Route
                            path='account/:address/wallet-balances'
                            element={
                                <Portfolio specificTab='wallet-balances' />
                            }
                        />
                        <Route
                            path='account/:address/xp'
                            element={<Portfolio isLevelsPage />}
                        />
                        <Route
                            path='account/:address/xp/history'
                            element={
                                <Portfolio isLevelsPage isViewMoreActive />
                            }
                        />
                        <Route path='/:address' element={<Portfolio />} />
                        <Route
                            path='/:address/transactions'
                            element={<Portfolio specificTab='transactions' />}
                        />
                        <Route
                            path='/:address/limits'
                            element={<Portfolio specificTab='limits' />}
                        />
                        <Route
                            path='/:address/liquidity'
                            element={<Portfolio specificTab='liquidity' />}
                        />
                        <Route
                            path='/:address/points'
                            element={<Portfolio specificTab='points' />}
                        />
                        <Route
                            path='/:address/exchange-balances'
                            element={
                                <Portfolio specificTab='exchange-balances' />
                            }
                        />
                        <Route
                            path='/:address/wallet-balances'
                            element={
                                <Portfolio specificTab='wallet-balances' />
                            }
                        />
                        <Route
                            path='/:address/xp'
                            element={<Portfolio isLevelsPage />}
                        />
                        <Route
                            path='/:address/xp/history'
                            element={
                                <Portfolio isLevelsPage isViewMoreActive />
                            }
                        />
                        <Route
                            path='swap'
                            element={
                                <Navigate replace to={defaultUrlParams.swap} />
                            }
                        />
                        {/* refactor EXPLORE as a nested route */}
                        <Route
                            path='explore'
                            element={<Navigate to='/explore/pools' replace />}
                        />
                        <Route
                            path='explore/pools'
                            element={<Explore view='pools' />}
                        />
                        <Route
                            path='explore/tokens'
                            element={<Explore view='tokens' />}
                        />
                        <Route path='swap/:params' element={<Swap />} />
                        <Route path='terms' element={<TermsOfService />} />
                        <Route path='privacy' element={<PrivacyPolicy />} />
                        <Route
                            path='faq'
                            element={<Navigate to='/faq/points' replace />}
                        />
                        <Route path='faq/points' element={<FAQPoints />} />
                        <Route
                            path='faq/points/:params'
                            element={<FAQPoints />}
                        />
                        {IS_LOCAL_ENV && (
                            <Route path='testpage' element={<TestPage />} />
                        )}
                        {IS_LOCAL_ENV && (
                            <Route
                                path='template/form'
                                element={<ExampleForm />}
                            />
                        )}
                        <Route path='/404' element={<NotFound />} />
                        <Route
                            path='*'
                            element={<Navigate to='/404' replace />}
                        />
                    </Routes>
                </section>
            </FlexContainer>
            <div data-theme={skin} className='footer_container'>
                {currentLocation !== '/' &&
                    currentLocation !== '/404' &&
                    currentLocation !== '/terms' &&
                    currentLocation !== '/privacy' &&
                    currentLocation !== '/faq' &&
                    !currentLocation.includes('/chat') &&
                    isChatEnabled && <ChatPanel isFullScreen={false} />}
                {showMobileVersion && currentLocation !== '/' && (
                    <FooterNav />
                )}
            </div>
            <GlobalPopup data-theme={skin} />
            <SnackbarComponent />
            {isWalletModalOpen && <GateWalletModal />}
        </>
    );
}

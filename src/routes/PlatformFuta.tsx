import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import Accessibility from '../pages/common/Accessibility/Accessibility';
import FAQPoints from '../pages/common/FAQ/FAQPoints';
import NotFound from '../pages/common/NotFound/NotFound';
import PrivacyPolicy from '../pages/common/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from '../pages/common/TermsOfService/TermsOfService';
import TestPage from '../pages/common/TestPage/TestPage';
import Account from '../pages/platformFuta/Account/Account';
import Auctions from '../pages/platformFuta/Auctions/Auctions';
import Create from '../pages/platformFuta/Create/Create';
import Explore from '../pages/platformFuta/Explore/Explore';
import FutaNewLanding from '../pages/platformFuta/Home/FutaLandings/NewLandings/FutaNewLanding';
import Learn from '../pages/platformFuta/Learn/Learn';
import LimitFuta from '../pages/platformFuta/LimitFuta/LimitFuta';
import SwapFuta from '../pages/platformFuta/SwapFuta/SwapFuta';
import Ticker from '../pages/platformFuta/Ticker/Ticker';
import { useMediaQuery } from '../utils/hooks/useMediaQuery';

const PlatformFutaRoutes: React.FC = () => {
    const { defaultUrlParams } = useContext(CrocEnvContext);

    const desktopScreen: boolean = useMediaQuery('(min-width: 768px)');

    return (
        <div
            style={{ background: 'var(--dark1)', height: '100%' }}
            className='futa_routes'
        >
            <Routes>
                <Route path='/' element={<FutaNewLanding />} />
                <Route
                    path='/swap'
                    element={<Navigate replace to={defaultUrlParams.swap} />}
                />
                <Route path='swap/:params' element={<SwapFuta />} />
                <Route path='limit' element={<LimitFuta />} />

                <Route path='/explore' element={<Explore />} />
                <Route path='/learn' element={<Learn />} />
                <Route path='/account' element={<Account />} />

                <Route
                    path='/auctions'
                    element={<Auctions placeholderTicker />}
                />

                {/* <Route
                    path='/trade'
                    element={<Navigate to='/explore' replace />}
                /> */}
                <Route path='/create' element={<Create />} />
                <Route
                    path='/auctions/ticker'
                    element={desktopScreen ? <Auctions /> : <Ticker />}
                />
                <Route
                    path='/auctions/:version/:ticker'
                    element={desktopScreen ? <Auctions /> : <Ticker />}
                />
                <Route path='/accessibility' element={<Accessibility />} />
                <Route path='/terms' element={<TermsOfService />} />
                <Route path='/privacy' element={<PrivacyPolicy />} />
                <Route
                    path='/faq'
                    element={<Navigate to='/faq/points' replace />}
                />
                <Route path='/faq/points' element={<FAQPoints />} />
                <Route path='/faq/points/:params' element={<FAQPoints />} />
                <Route path='/404' element={<NotFound />} />
                {/* <Route path="*" element={<Navigate to="/404" replace />} /> */}
                <Route
                    path='/testpage'
                    element={IS_LOCAL_ENV ? <TestPage /> : <NotFound />}
                />
                <Route path='/account/:address' element={<Account />} />
                <Route path='/:address' element={<Account />} />
            </Routes>
        </div>
    );
};

export default PlatformFutaRoutes;

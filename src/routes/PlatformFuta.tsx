import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/platformFuta/Home/Home';
import Explore from '../pages/platformFuta/Explore/Explore';
import Learn from '../pages/platformFuta/Learn/Learn';
import Account from '../pages/platformFuta/Account/Account';
import Auctions from '../pages/platformFuta/Auctions/Auctions';
import Create from '../pages/platformFuta/Create/Create';
import Ticker from '../pages/platformFuta/Ticker/Ticker';
import useMediaQuery from '../utils/hooks/useMediaQuery';
import SwapFuta from '../pages/platformFuta/SwapFuta/SwapFuta';
import LimitFuta from '../pages/platformFuta/LimitFuta/LimitFuta';

const PlatformFutaRoutes: React.FC = () => {
    const [hasVideoPlayedOnce, setHasVideoPlayedOnce] = useState(false);
    const desktopScreen = useMediaQuery('(min-width: 1280px)');

    return (
        <div style={{ background: 'var(--dark1)' }}>
            <Routes>
                <Route
                    path='/'
                    element={
                        <Home
                            hasVideoPlayedOnce={hasVideoPlayedOnce}
                            setHasVideoPlayedOnce={setHasVideoPlayedOnce}
                        />
                    }
                />
                <Route path='swap' element={<SwapFuta />} />
                <Route path='limit' element={<LimitFuta />} />

                <Route path='/explore' element={<Explore />} />
                <Route path='/learn' element={<Learn />} />
                <Route path='/account' element={<Account />} />
                <Route path='/account/:address' element={<Account />} />
                <Route path='/:address' element={<Account />} />
                <Route
                    path='/auctions'
                    element={<Auctions placeholderTicker />}
                />

                <Route
                    path='/trade'
                    element={<Navigate to='/explore' replace />}
                />
                <Route path='/create' element={<Create />} />
                <Route
                    path='/auctions/ticker'
                    element={desktopScreen ? <Auctions /> : <Ticker />}
                />
                <Route
                    path='/auctions/:version/:ticker'
                    element={desktopScreen ? <Auctions /> : <Ticker />}
                />
            </Routes>
        </div>
    );
};

export default PlatformFutaRoutes;

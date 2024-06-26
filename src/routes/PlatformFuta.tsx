import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/platformFuta/Home/Home';
import Explore from '../pages/platformFuta/Explore/Explore';
import Swap from '../pages/platformFuta/Swap/Swap';
import Learn from '../pages/platformFuta/Learn/Learn';
import Account from '../pages/platformFuta/Account/Account';
import Auctions from '../pages/platformFuta/Auctions/Auctions';
import Create from '../pages/platformFuta/Create/Create';
import Ticker from '../pages/platformFuta/Ticker/Ticker';
import useMediaQuery from '../utils/hooks/useMediaQuery';

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

                <Route path='/explore' element={<Explore />} />
                <Route path='/swap' element={<Swap />} />
                <Route path='/learn' element={<Learn />} />
                <Route path='/account' element={<Account />} />
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

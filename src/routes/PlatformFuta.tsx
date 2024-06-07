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

const PlatformFutaRoutes: React.FC = () => {
    const [hasVideoPlayedOnce, setHasVideoPlayedOnce] = useState(false);

    return (
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
            <Route path='/auctions' element={<Auctions />} />

            <Route path='/trade' element={<Navigate to='/explore' replace />} />
            <Route path='/auctions/create' element={<Create />} />
            <Route path='/auctions/ticker' element={<Ticker />} />
        </Routes>
    );
};

export default PlatformFutaRoutes;

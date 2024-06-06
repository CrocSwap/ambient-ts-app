import React, { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/platformFuta/Home/Home';
import Explore from '../pages/platformFuta/Explore/Explore';
import Swap from '../pages/platformFuta/Swap/Swap';
import Learn from '../pages/platformFuta/Learn/Learn';
import Account from '../pages/platformFuta/Account/Account';
import Create from '../pages/platformFuta/Create/Create';
import Auctions from '../pages/platformFuta/Auctions/Auctions';

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
            <Route path='/create' element={<Create />} />
            <Route path='/auctions' element={<Auctions />} />
            <Route path='/trade' element={<Navigate to='/explore' replace />} />
        </Routes>
    );
};

export default PlatformFutaRoutes;

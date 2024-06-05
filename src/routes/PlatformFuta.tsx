import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/platformFuta/Home/Home';
import Explore from '../pages/platformFuta/Explore/Explore';
import Swap from '../pages/platformFuta/Swap/Swap';

const PlatformFutaRoutes: React.FC = () => (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/SWAP' element={<Swap />} />
        <Route path='/trade' element={<Navigate to='/explore' replace />} />
    </Routes>
);

export default PlatformFutaRoutes;

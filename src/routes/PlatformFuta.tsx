import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../pages/platformFuta/Home/Home';
import Explore from '../pages/platformFuta/Explore/Explore';
import Swap from '../pages/platformFuta/Swap/Swap';
import Learn from '../pages/platformFuta/Learn/Learn';
import Account from '../pages/platformFuta/Account/Account';
import Create from '../pages/platformFuta/Create/Create';

const PlatformFutaRoutes: React.FC = () => (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/swap' element={<Swap />} />
        <Route path='/learn' element={<Learn />} />
        <Route path='/account' element={<Account />} />
        <Route path='/create' element={<Create />} />
        <Route path='/trade' element={<Navigate to='/explore' replace />} />
    </Routes>
);

export default PlatformFutaRoutes;

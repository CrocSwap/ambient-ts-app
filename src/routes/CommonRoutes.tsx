import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import Accessibility from '../pages/common/Accessibility/Accessibility';
import FAQPoints from '../pages/common/FAQ/FAQPoints';
import NotFound from '../pages/common/NotFound/NotFound';
import PrivacyPolicy from '../pages/common/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from '../pages/common/TermsOfService/TermsOfService';
import TestPage from '../pages/common/TestPage/TestPage';

const CommonRoutes: React.FC = () => (
    <Routes>
        <Route path='/accessibility' element={<Accessibility />} />
        <Route path='/terms' element={<TermsOfService />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
        <Route path='/faq' element={<Navigate to='/faq/points' replace />} />
        <Route path='/faq/points' element={<FAQPoints />} />
        <Route path='/faq/points/:params' element={<FAQPoints />} />
        <Route path='/404' element={<NotFound />} />
        {/* <Route path="*" element={<Navigate to="/404" replace />} /> */}
        <Route
            path='/testpage'
            element={IS_LOCAL_ENV ? <TestPage /> : <NotFound />}
        />
    </Routes>
);

export default CommonRoutes;

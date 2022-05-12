/** ***** Import React and Dongles *******/
import { Routes, Route } from 'react-router-dom';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Trade from '../pages/Trade/Trade';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
import Market from '../pages/Trade/Market/Market';
import Limit from '../pages/Trade/Limit/Limit';
import Liquidity from '../pages/Trade/Liquidity/Liquidity';
import Chart from '../pages/Chart/Chart';
import TestPage from '../pages/TestPage/TestPage';

/** * **** Import Local Files *******/
import './App.css';

/** ***** React Function *******/
export default function App() {
    return (
        <>
            <div className='content-container'>
                <PageHeader />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path='trade' element={<Trade />}>
                        <Route path='market' element={<Market />} />
                        <Route path='limit' element={<Limit />} />
                        <Route path='liquidity' element={<Liquidity />} />
                    </Route>
                    <Route path='analytics' element={<Analytics />} />
                    <Route path='portfolio' element={<Portfolio />} />
                    <Route path='chart' element={<Chart />} />
                    <Route path='testpage' element={<TestPage />} />
                </Routes>
            </div>

            <PageFooter />
        </>
    );
}
